
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IDbAccountResponseDTO } from '../../entities/IDbAccountResponseDTO'; // Asigură-te că calea este corectă

interface SelectedAccountContextType {
  selectedAccount: IDbAccountResponseDTO | null; // Poate fi un obiect cont sau null (pentru balanța totală)
  setSelectedAccount: (account: IDbAccountResponseDTO | null) => void;
}

const SelectedAccountContext = createContext<SelectedAccountContextType | undefined>(undefined);

export const SelectedAccountProvider = ({ children }: { children: ReactNode }) => {
  const [selectedAccount, setSelectedAccount] = useState<IDbAccountResponseDTO | null>(null);

  return (
    <SelectedAccountContext.Provider value={{ selectedAccount, setSelectedAccount }}>
      {children}
    </SelectedAccountContext.Provider>
  );
};

export const useSelectedAccount = () => {
  const context = useContext(SelectedAccountContext);
  if (context === undefined) {
    throw new Error('useSelectedAccount must be used within a SelectedAccountProvider');
  }
  return context;
};