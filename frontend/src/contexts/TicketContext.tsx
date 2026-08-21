import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Ticket } from '../types';

interface TicketContextType {
  inspectTicket: Ticket | null;
  setInspectTicket: (ticket: Ticket | null) => void;
  isSubmitOpen: boolean;
  setIsSubmitOpen: (isOpen: boolean) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inspectTicket, setInspectTicket] = useState<Ticket | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  return (
    <TicketContext.Provider value={{
      inspectTicket,
      setInspectTicket,
      isSubmitOpen,
      setIsSubmitOpen,
      refreshTrigger,
      triggerRefresh
    }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTicketContext = () => {
  const context = useContext(TicketContext);
  if (!context) throw new Error("useTicketContext must be used within a TicketProvider");
  return context;
};
