import React, { createContext, useContext, useMemo, useState } from 'react';

type MachineContextValue = {
  selectedMachineId: string | null;
  setSelectedMachineId: (id: string | null) => void;
};

const MachineContext = createContext<MachineContextValue | undefined>(undefined);

export const MachineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);

  const value = useMemo(() => ({ selectedMachineId, setSelectedMachineId }), [selectedMachineId]);
  return <MachineContext.Provider value={value}>{children}</MachineContext.Provider>;
};

export const useMachine = () => {
  const ctx = useContext(MachineContext);
  if (!ctx) throw new Error('useMachine must be used within MachineProvider');
  return ctx;
};


