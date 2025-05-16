// src/components/MainContent/MainContent.tsx
import './MainContent.css';
import RecentTransactions from '../RecentTransactions/RecentTransactions';
import { useSelectedAccount } from '../SelectedAccountContext/SelectedAccountContext';
import { useGetUserDbAccountsQuery } from '../../store/bankingApi';
import { IDbAccountResponseDTO } from '../../entities/IDbAccountResponseDTO';

// SIMULARE RATE DE CONVERSIE (într-o aplicație reală, acestea ar veni dintr-un API/config)
const exchangeRatesToLEI: Record<string, number> = {
  'LEI': 1,
  'USD': 17.70, // Exemplu
  'EUR': 19.00, // Exemplu
};

const convertToLEI = (amount: number, currency: string): number => {
  return amount * (exchangeRatesToLEI[currency] || 0); // Returnează 0 dacă moneda nu e cunoscută
};

const MainContent = () => {
  const { selectedAccount } = useSelectedAccount();
  const { data: userAccounts, isLoading: isLoadingAccounts, isError: isErrorAccounts } = useGetUserDbAccountsQuery();

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
    displayAccountNumber = "";
  } else if (isErrorAccounts) {
    displayTitle = "Balanță";
    displayBalance = "Eroare la încărcare";
    displayAccountNumber = "";
  } else if (selectedAccount) {
    displayTitle = `Cont ${selectedAccount.accountTypeName}`;
    displayBalance = formatBalanceDisplay(selectedAccount.balance, selectedAccount.currency);
    displayAccountNumber = selectedAccount.accountNumber;
  } else if (userAccounts && userAccounts.length > 0) {
    const totalBalanceData = calculateTotalBalanceInLEI();
    if (totalBalanceData) {
      displayBalance = formatBalanceDisplay(totalBalanceData.total, totalBalanceData.currency);
    } else {
      displayBalance = "N/A"; // Nu s-a putut calcula (ex: nicio rată de schimb)
    }
    displayAccountNumber = "Toate conturile";
  } else {
    // Nu sunt conturi, dar nu este eroare
    displayTitle = "Balanță Totală";
    displayBalance = "Nu există conturi";
    displayAccountNumber = "";
  }

   return (
    <main className="bank-main-content">
      <div className="dashboard-grid">
        {/* Balance Section ... */}
        <section className="balance-card">
          <h2>{displayTitle}</h2>
          <div className="balance-amount">{displayBalance}</div>
          {displayAccountNumber && <div className="account-number">{displayAccountNumber}</div>}
        </section>

        {/* Quick Actions ... */}
        <section className="quick-actions">
          <h3>Operațiuni Rapide</h3>
          <div className="action-buttons">
            <button className="action-btn transfer">
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
            <button className="action-btn deposit">
              <div className="action-btn-inner">
                <span className="action-icon">+</span>
                <span>Depunere</span>
              </div>
            </button>
          </div>
        </section>

        {/* Transactions */}
        <RecentTransactions 
          selectedAccountNumber={selectedAccount?.accountNumber} 
          selectedAccountCurrency={selectedAccount?.currency} // Pasează moneda contului selectat
        />
      </div>
    </main>
  );
};

export default MainContent;