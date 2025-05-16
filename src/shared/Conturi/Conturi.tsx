// src/components/Conturi/Conturi.tsx
import { useState, useRef, useEffect } from 'react';
import { useGetUserDbAccountsQuery } from '../../store/bankingApi';
import './Conturi.css';
import { IDbAccountResponseDTO } from '../../entities/IDbAccountResponseDTO';
import { useSelectedAccount } from '../SelectedAccountContext/SelectedAccountContext'; // Importă contextul pentru contul selectat

const Conturi = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setSelectedAccount, selectedAccount } = useSelectedAccount(); // Folosește contextul

  const {
    data: userAccounts,
    isLoading,
    isError,
  } = useGetUserDbAccountsQuery();

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccountSelect = (account: IDbAccountResponseDTO | null) => {
    setSelectedAccount(account);
    setShowDropdown(false); // Închide dropdown-ul după selecție
  };

  const formatBalance = (balance: number, currency: string): string => {
    return `${balance.toLocaleString('ro-MD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  return (
    <div className="nav-btn-container" ref={dropdownRef}>
      <button
        className="nav-btn"
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isLoading}
      >
        {/* Afișează numele contului selectat sau "Conturi" */}
        {selectedAccount ? selectedAccount.accountTypeName : 'Conturi'} 
      </button>

      {showDropdown && (
        <div className="accounts-dropdown">
          <div className="dropdown-header">Conturile mele</div>
          {isLoading && <div className="dropdown-loading">Se încarcă conturile...</div>}
          {isError && <div className="dropdown-error">Eroare la încărcarea conturilor.</div>}
          
          {/* Opțiune pentru a afișa Balanța Totală (deselectează contul) */}
          <div 
            className={`account-item ${!selectedAccount ? 'active-account' : ''}`} // Clasă pentru stilizare dacă e activ
            onClick={() => handleAccountSelect(null)}
          >
            <div className="account-type">Balanță Totală</div>
            {/* Poți alege să nu afișezi un sold specific aici sau să lași gol */}
          </div>

          {!isLoading && !isError && userAccounts && userAccounts.length > 0 && (
            userAccounts.map((account: IDbAccountResponseDTO) => (
              <div 
                key={account.id} 
                className={`account-item ${selectedAccount?.id === account.id ? 'active-account' : ''}`}
                onClick={() => handleAccountSelect(account)}
              >
                <div className="account-type">{account.accountTypeName}</div>
                <div className="account-balance">
                  {formatBalance(account.balance, account.currency)}
                </div>
              </div>
            ))
          )}
          {!isLoading && !isError && (!userAccounts || userAccounts.length === 0) && (
            <div className="dropdown-no-accounts">Nu aveți conturi deschise.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Conturi;