import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from app.services.gemini_service import GeminiService


def test_health_check_endpoint(client: TestClient):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "unhealthy"]
    assert "gemini_model" in data


def test_create_ticket_success(client: TestClient):
    payload = {
        "customer_name": "Sarah Connor",
        "customer_email": "sarah.connor@example.com",
        "subject": "Unable to log in to corporate dashboard",
        "message": "I entered my correct password but get an error saying 'Session expired 401'. Please help me reset my account access."
    }
    response = client.post("/api/v1/tickets", json=payload)
    assert response.status_code == 201
    data = response.json()
    
    assert data["id"] is not None
    assert data["ticket_number"].startswith("TICK-")
    assert data["customer_name"] == "Sarah Connor"
    assert data["customer_email"] == "sarah.connor@example.com"
    assert data["status"] == "Open"
    
    # Verify AI outputs are populated
    assert data["category"] in [
        "Technical Issue", "Billing & Payments", "Account Access",
        "Feature Request", "Product Inquiry", "Bug Report", "General Feedback", "Other"
    ]
    assert data["priority"] in ["Critical", "High", "Medium", "Low"]
    assert data["sentiment"] in ["Positive", "Neutral", "Frustrated", "Angry", "Urgent"]
    assert len(data["summary"]) > 5
    assert len(data["customer_intent"]) > 3
    assert len(data["suggested_action"]) > 5
    assert len(data["suggested_response"]) > 10


def test_create_ticket_invalid_input(client: TestClient):
    # Invalid email
    payload = {
        "customer_name": "Sarah Connor",
        "customer_email": "not-an-email",
        "subject": "Help",
        "message": "Too short"
    }
    response = client.post("/api/v1/tickets", json=payload)
    assert response.status_code == 422  # Unprocessable Entity


def test_create_ticket_sql_injection_resilience(client: TestClient):
    """Ensure SQL injection strings are safely stored as text without corrupting the DB."""
    payload = {
        "customer_name": "'; DROP TABLE tickets; --",
        "customer_email": "injection@example.com",
        "subject": "1' OR '1'='1",
        "message": "Testing resilience against SQL injection payload: '; DROP TABLE tickets; --"
    }
    response = client.post("/api/v1/tickets", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["customer_name"] == "'; DROP TABLE tickets; --"
    
    # Check that database is intact
    health = client.get("/api/v1/health")
    assert health.status_code == 200


def test_list_tickets_and_filtering(client: TestClient):
    # Create two distinct tickets
    client.post("/api/v1/tickets", json={
        "customer_name": "User One",
        "customer_email": "user1@example.com",
        "subject": "CRITICAL Server Outage",
        "message": "Server is completely down emergency!"
    })
    client.post("/api/v1/tickets", json={
        "customer_name": "User Two",
        "customer_email": "user2@example.com",
        "subject": "Refund requested for double billing",
        "message": "I was billed twice on my invoice. Please refund the extra charge."
    })
    
    # List all
    response = client.get("/api/v1/tickets")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert len(data["tickets"]) >= 2
    
    # Search for "billing"
    search_res = client.get("/api/v1/tickets?search=billing")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["total"] >= 1
    assert any("billing" in t["subject"].lower() or "billing" in t["message"].lower() for t in search_data["tickets"])


def test_get_ticket_by_id(client: TestClient):
    create_res = client.post("/api/v1/tickets", json={
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "subject": "Password reset link not working",
        "message": "The password reset link says token expired immediately."
    })
    ticket_id = create_res.json()["id"]
    
    get_res = client.get(f"/api/v1/tickets/{ticket_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == ticket_id
    
    # Not found
    not_found_res = client.get("/api/v1/tickets/999999")
    assert not_found_res.status_code == 404


def test_update_ticket_status(client: TestClient):
    create_res = client.post("/api/v1/tickets", json={
        "customer_name": "Jane Smith",
        "customer_email": "jane@example.com",
        "subject": "Billing issue on renewal",
        "message": "My subscription renewed at the wrong tier price."
    })
    ticket_id = create_res.json()["id"]
    
    # Update to In Progress
    update_res = client.patch(f"/api/v1/tickets/{ticket_id}", json={
        "status": "In Progress",
        "agent_notes": "Assigned to billing agent Michael."
    })
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "In Progress"
    assert update_res.json()["agent_notes"] == "Assigned to billing agent Michael."
    assert update_res.json()["resolved_at"] is None
    
    # Update to Resolved
    resolve_res = client.patch(f"/api/v1/tickets/{ticket_id}", json={
        "status": "Resolved"
    })
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "Resolved"
    assert resolve_res.json()["resolved_at"] is not None


def test_reanalyze_ticket(client: TestClient):
    create_res = client.post("/api/v1/tickets", json={
        "customer_name": "Alex Vance",
        "customer_email": "alex@example.com",
        "subject": "Severe crash in production cluster",
        "message": "Crash in production cluster node 4. Need immediate fix."
    })
    ticket_id = create_res.json()["id"]
    
    re_res = client.post(f"/api/v1/tickets/{ticket_id}/reanalyze")
    assert re_res.status_code == 200
    assert re_res.json()["id"] == ticket_id
    assert len(re_res.json()["summary"]) > 0


def test_gemini_api_timeout_and_error_fallback(client: TestClient):
    """Test that when Gemini API throws an exception or times out, the service falls back gracefully."""
    with patch.object(GeminiService, "_call_gemini_api", side_effect=TimeoutError("API timed out")):
        payload = {
            "customer_name": "Grace Hopper",
            "customer_email": "grace@navy.mil",
            "subject": "Compiler glitch in subroutine",
            "message": "Found a moth in relay 70 causing calculation error."
        }
        response = client.post("/api/v1/tickets", json=payload)
        # Should gracefully fallback and return 201 with analyzed data
        assert response.status_code == 201
        data = response.json()
        assert data["category"] in ["Technical Issue", "Bug Report"]
        assert len(data["suggested_response"]) > 0
