from fastapi.testclient import TestClient


def test_dashboard_stats_endpoint(client: TestClient):
    # Seed 2 tickets
    client.post("/api/v1/tickets", json={
        "customer_name": "Test Alpha",
        "customer_email": "alpha@example.com",
        "subject": "CRITICAL: Database connection pool exhausted",
        "message": "Database max connections reached, system crashing immediately!"
    })
    client.post("/api/v1/tickets", json={
        "customer_name": "Test Beta",
        "customer_email": "beta@example.com",
        "subject": "Request for feature dark mode",
        "message": "It would be great to have dark mode in the customer portal."
    })
    
    response = client.get("/api/v1/stats")
    assert response.status_code == 200
    data = response.json()
    
    assert data["total_tickets"] >= 2
    assert "open_tickets" in data
    assert "high_priority_tickets" in data
    assert "category_breakdown" in data
    assert isinstance(data["category_breakdown"], list)
    assert "sentiment_breakdown" in data
    assert isinstance(data["sentiment_breakdown"], list)
    assert "priority_breakdown" in data
    assert isinstance(data["priority_breakdown"], list)
    assert len(data["recent_tickets"]) >= 2
