// src/shared/Conturi/Conturi.tsx
import React, { useState, useRef, useEffect } from 'react'; // Adaugă React
import { useGetUserDbAccountsQuery, bankingApiSlice } from '../../store/bankingApi';
import './Conturi.css';
import { IDbAccountResponseDTO } from '../../entities/IDbAccountResponseDTO';
import { useSelectedAccount } from '../../context/SelectedAccountContext/SelectedAccountContext';
import CreateAccountModal from '../../components/Modals/CreateAccountModal';
import { FaPlusCircle } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { ACCOUNT_TYPES_FOR_CREATION, AccountTypeOption } from '../../constants/accountTypes'; // Importăm lista completă

const Conturi: React.FC = () => { // Adaugă React.FC dacă nu e deja
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setSelectedAccount, selectedAccount } = useSelectedAccount();
  const dispatch = useDispatch();

  const {
    data: userAccounts, // Acestea sunt conturile existente ale utilizatorului
    isLoading,
    isError,
  } = useGetUserDbAccountsQuery();

  // Calculăm tipurile de conturi pe care utilizatorul le poate crea
  const [creatableAccountTypes, setCreatableAccountTypes] = useState<AccountTypeOption[]>(ACCOUNT_TYPES_FOR_CREATION);

  useEffect(() => {
    if (userAccounts && userAccounts.length >= 0) { // Verifică și dacă userAccounts este definit
      const existingAccountTypeNames = userAccounts.map(acc => acc.accountTypeName);
      const filteredTypes = ACCOUNT_TYPES_FOR_CREATION.filter(
        option => !existingAccountTypeNames.includes(option.value)
      );
      setCreatableAccountTypes(filteredTypes);
    } else if (!isLoading && !isError) { // Dacă nu se încarcă, nu e eroare, dar nu sunt conturi
        setCreatableAccountTypes(ACCOUNT_TYPES_FOR_CREATION); // Poate crea orice
    }
  }, [userAccounts, isLoading, isError]); // Recalculează la schimbarea conturilor utilizatorului

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
    setShowDropdown(false);
  };

  const handleOpenCreateAccountModal = () => {
    if (creatableAccountTypes.length > 0) { // Deschide modalul doar dacă sunt tipuri disponibile
      setShowDropdown(false);
      setIsCreateAccountModalOpen(true);
    } else {
      // Opcional: afișează o notificare că nu mai poate crea conturi
      alert("Ați deschis deja toate tipurile de conturi disponibile.");
    }
  };

  const handleCloseCreateAccountModal = () => {
    setIsCreateAccountModalOpen(false);
  };

  const handleCreateAccountSuccess = (newAccountName: string) => {
    console.log(`Account "${newAccountName}" created successfully. Refetching accounts...`);
    dispatch(bankingApiSlice.util.invalidateTags([{ type: 'UserAccount', id: 'LIST' }]));
    // Nu închide modalul imediat, lasă utilizatorul să vadă mesajul de succes
    // setTimeout(() => setIsCreateAccountModalOpen(false), 3000);
  };

  const formatBalance = (balance: number, currency: string): string => {
    return `${balance.toLocaleString('ro-MD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  const canCreateMoreAccounts = creatableAccountTypes.length > 0;

  return (
    <>
      <div className="nav-btn-container" ref={dropdownRef}>
        <button
          className="nav-btn"
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isLoading}
        >
          {selectedAccount ? selectedAccount.accountTypeName.replace('_', ' ') : 'Conturi'}
        </button>

        {showDropdown && (
          <div className="accounts-dropdown">
            <div className="dropdown-header">Conturile mele</div>
            {isLoading && <div className="dropdown-loading">Se încarcă conturile...</div>}
            {isError && <div className="dropdown-error">Eroare la încărcarea conturilor.</div>}

            <div
              className={`account-item ${!selectedAccount ? 'active-account' : ''}`}
              onClick={() => handleAccountSelect(null)}
            >
              <div className="account-type">Balanță Totală</div>
            </div>

            {!isLoading && !isError && userAccounts && userAccounts.length > 0 && (
              userAccounts.map((account: IDbAccountResponseDTO) => (
                <div
                  key={account.id}
                  className={`account-item ${selectedAccount?.id === account.id ? 'active-account' : ''}`}
                  onClick={() => handleAccountSelect(account)}
                >
                  <div className="account-type">{account.accountTypeName.replace('_', ' ')}</div>
                  <div className="account-balance">
                    {formatBalance(account.balance, account.currency)}
                  </div>
                </div>
              ))
            )}
            {!isLoading && !isError && (!userAccounts || userAccounts.length === 0) && (
              <div className="dropdown-no-accounts">Nu aveți conturi deschise.</div>
            )}
            <div className="dropdown-separator"></div>
            <button
              className="account-item-action create-new-account-btn"
              onClick={handleOpenCreateAccountModal}
              disabled={!canCreateMoreAccounts || isLoading} // Dezactivează dacă nu poate crea sau se încarcă
              title={!canCreateMoreAccounts ? "Ați deschis toate tipurile de conturi disponibile" : "Deschide un cont nou"}
            >
              <FaPlusCircle className="action-icon" />
              <span>Deschide Cont Nou</span>
            </button>
          </div>
        )}
      </div>

      {/* Pasează lista filtrată de tipuri de conturi către modal */}
      {isCreateAccountModalOpen && creatableAccountTypes.length > 0 && (
        <CreateAccountModal
          isOpen={isCreateAccountModalOpen}
          onClose={handleCloseCreateAccountModal}
          onCreateSuccess={handleCreateAccountSuccess}
          availableAccountTypes={creatableAccountTypes} // Prop nou
        />
      )}
    </>
  );
};

export default Conturi;