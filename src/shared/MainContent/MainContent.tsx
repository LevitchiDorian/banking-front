import { useState, useEffect } from 'react'; // Adaugă useEffect
import './MainContent.css';
import RecentTransactions from '../RecentTransactions/RecentTransactions'; // Ajustează calea
import { useSelectedAccount } from '../../context/SelectedAccountContext/SelectedAccountContext'; // Ajustează calea
import { useGetUserDbAccountsQuery } from '../../store/bankingApi'; // Ajustează calea
import TransferTypeSelectionModal from '../../components/Modals/TransferTypeSelectionModal'; // Ajustează calea
import TransferFormModal from '../../components/Modals/TransferFormModal'; // Ajustează calea

// Definim tipurile de transferuri pe care le vom gestiona
export type TransferType = 'own_account' | 'intrabank' | 'domestic_bank' | null;

// SIMULARE RATE DE CONVERSIE (mută într-un fișier utilitar sau context dacă e folosit global)
const exchangeRatesToLEI: Record<string, number> = {
  'LEI': 1,
  'USD': 17.50,
  'EUR': 19.00,
};
const convertToLEI = (amount: number, currency: string): number => {
  return amount * (exchangeRatesToLEI[currency.toUpperCase()] || 0);
};


const MainContent = () => {
  const { selectedAccount} = useSelectedAccount(); // Adaugă setSelectedAccount dacă vrei să resetezi din MainContent
  const { data: userAccounts, isLoading: isLoadingAccounts, isError: isErrorAccounts } = useGetUserDbAccountsQuery();

  // Stări pentru gestionarea modalelor
  const [isTransferTypeModalOpen, setIsTransferTypeModalOpen] = useState(false);
  const [activeTransferForm, setActiveTransferForm] = useState<TransferType>(null);

  const handleOpenTransferTypeModal = () => {
    setIsTransferTypeModalOpen(true);
    setActiveTransferForm(null); 
  };

  const handleCloseTransferTypeModal = () => {
    setIsTransferTypeModalOpen(false);
  };

  const handleSelectTransferType = (type: TransferType) => {
    if(type){ // Doar dacă un tip valid este selectat
      setIsTransferTypeModalOpen(false); 
      setActiveTransferForm(type);     
    } else { // Dacă se anulează din modalul de selecție tip
      setIsTransferTypeModalOpen(false);
      setActiveTransferForm(null);
    }
  };

  const handleCloseTransferFormModal = () => {
    setActiveTransferForm(null);
  };

  // Efect pentru a adăuga/șterge clasa de blur pe body
  useEffect(() => {
    if (isTransferTypeModalOpen || activeTransferForm) {
      document.body.classList.add('modal-open-blur');
    } else {
      document.body.classList.remove('modal-open-blur');
    }
    // Cleanup la unmount
    return () => {
      document.body.classList.remove('modal-open-blur');
    };
  }, [isTransferTypeModalOpen, activeTransferForm]);


  const formatBalanceDisplay = (balance: number, currency: string): string => {
    return `${balance.toLocaleString('ro-MD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  const calculateTotalBalanceInLEI = (): { total: number; currency: string } | null => {
    if (!userAccounts || userAccounts.length === 0) {
      return null;
    }
    const totalLEI = userAccounts.reduce((sum, account) => {
      return sum + convertToLEI(account.balance, account.currency);
    }, 0);
    return { total: totalLEI, currency: 'LEI' };
  };

  let displayTitle = "Balanță Totală";
  let displayBalance = "0.00 LEI";
  let displayAccountNumber = "";

  if (isLoadingAccounts) {
    displayTitle = "Balanță";
    displayBalance = "Se încarcă...";
  } else if (isErrorAccounts) {
    displayTitle = "Balanță";
    displayBalance = "Eroare la încărcare";
  } else if (selectedAccount) {
    displayTitle = `Cont ${selectedAccount.accountTypeName}`;
    displayBalance = formatBalanceDisplay(selectedAccount.balance, selectedAccount.currency);
    displayAccountNumber = selectedAccount.accountNumber;
  } else if (userAccounts && userAccounts.length > 0) {
    const totalBalanceData = calculateTotalBalanceInLEI();
    if (totalBalanceData) {
      displayBalance = formatBalanceDisplay(totalBalanceData.total, totalBalanceData.currency);
    } else {
      displayBalance = "N/A";
    }
    displayAccountNumber = "Toate conturile";
  } else {
    displayTitle = "Balanță Totală";
    displayBalance = "Nu există conturi";
  }

  return (
    // Nu mai adăugăm clasa 'blurred' aici, ci pe document.body prin useEffect
    <main className="bank-main-content"> 
      <div className="dashboard-grid">
        <section className="balance-card">
          <h2>{displayTitle}</h2>
          <div className="balance-amount">{displayBalance}</div>
          {displayAccountNumber && <div className="account-number">{displayAccountNumber}</div>}
        </section>

        <section className="quick-actions">
          <h3>Operațiuni Rapide</h3>
          <div className="action-buttons">
            <button className="action-btn transfer" onClick={handleOpenTransferTypeModal}>
              <div className="action-btn-inner">
                <span className="action-icon">→</span>
                <span>Transfer Nou</span>
              </div>
            </button>
            <button className="action-btn payment">
              <div className="action-btn-inner">
                <span className="action-icon">$</span>
                <span>Plată Facturi</span>
              </div>
            </button>
          </div>
        </section>

        <RecentTransactions
          selectedAccountNumber={selectedAccount?.accountNumber}
        />
      </div>

      {/* Randare condiționată a modalelor */}
      {isTransferTypeModalOpen && (
        <TransferTypeSelectionModal
          onClose={handleCloseTransferTypeModal}
          onSelectTransferType={handleSelectTransferType}
        />
      )}

      {activeTransferForm && (
        <TransferFormModal
          transferType={activeTransferForm}
          onClose={handleCloseTransferFormModal}
        />
      )}
    </main>
  );
};

export default MainContent;