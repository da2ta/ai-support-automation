import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { TicketsPage } from "./pages/TicketsPage";
import { TriagePage } from "./pages/TriagePage";
import { AIInsightsPage } from "./pages/AIInsightsPage";
import { LoginPage } from "./pages/LoginPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TicketProvider } from "./contexts/TicketContext";
import { TicketDetailDrawer } from "./components/tickets/TicketDetailDrawer";
import { SubmitTicketModal } from "./components/SubmitTicketModal";
import { useTicketContext } from "./contexts/TicketContext";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppInner: React.FC = () => {
  const { isSubmitOpen, setIsSubmitOpen, triggerRefresh } = useTicketContext();
  const { session } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/triage" element={<TriagePage />} />
          <Route path="/insights" element={<AIInsightsPage />} />
          <Route path="/analytics" element={<div className="p-8 text-white">Analytics Page (Coming Soon)</div>} />
          <Route path="/team" element={<div className="p-8 text-white">Team Page (Coming Soon)</div>} />
          <Route path="/settings" element={<div className="p-8 text-white">Settings Page (Coming Soon)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      
      {session && (
        <>
          <TicketDetailDrawer />
          <SubmitTicketModal 
            isOpen={isSubmitOpen}
            onClose={() => setIsSubmitOpen(false)} 
            onSubmit={async (input) => {
              const { ticketService } = await import("./services/tickets");
              await ticketService.submitTicket(input);
              setIsSubmitOpen(false);
              triggerRefresh();
            }} 
          />
        </>
      )}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TicketProvider>
          <AppInner />
        </TicketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
