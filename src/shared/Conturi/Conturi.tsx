import { useState, useRef, useEffect } from 'react';
import { useGetUserDbAccountsQuery } from '../../store/bankingApi'; // Ajustează calea dacă este necesar
import './Conturi.css';
import { IDbAccountResponseDTO } from '../../entities/IDbAccountResponseDTO'; // Importă interfața



const Conturi = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Utilizează hook-ul RTK Query pentru a prelua conturile
  const { 
    data: userAccounts, 
    isLoading, 
    isError, 
    // error 
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

  // Funcție pentru formatarea balanței (similar cu ce aveai, dar adaptat)
  const formatBalance = (balance: number, currency: string): string => {
    return `${balance.toLocaleString('ro-MD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  return (
    <div className="nav-btn-container" ref={dropdownRef}>
      <button
        className="nav-btn"
        onClick={() => setShowDropdown(!showDropdown)}
        // Dezactivează butonul dacă se încarcă datele sau a apărut o eroare majoră la încărcare
        disabled={isLoading} 
      >
        Conturi
      </button>

      {showDropdown && (
        <div className="accounts-dropdown">
          <div className="dropdown-header">Conturile mele</div>
          {isLoading && <div className="dropdown-loading">Se încarcă conturile...</div>}
          {isError && (
            <div className="dropdown-error">
              Eroare la încărcarea conturilor. {/* Poți afișa error.message dacă este relevant */}
              {/* {error && 'data' in error && error.data ? JSON.stringify(error.data) : 'Vă rugăm încercați mai târziu.'} */}
            </div>
          )}
          {!isLoading && !isError && userAccounts && userAccounts.length > 0 && (
            userAccounts.map((account: IDbAccountResponseDTO) => (
              <div key={account.id} className="account-item">
                <div className="account-type">{account.accountTypeName}</div> {/* Folosim accountNumber din DTO */}
                <div className="account-balance">
                  {formatBalance(account.balance, account.currency)} {/* Folosim balance și currency din DTO */}
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