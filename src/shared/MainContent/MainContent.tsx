// src/shared/MainContent/MainContent.tsx
import { useState, useEffect } from 'react';
import './MainContent.css';
import RecentTransactions from '../RecentTransactions/RecentTransactions';
import { useSelectedAccount } from '../../context/SelectedAccountContext/SelectedAccountContext';
import { useGetUserDbAccountsQuery, useLazyDownloadAccountStatementQuery } from '../../store/bankingApi';
import TransferTypeSelectionModal from '../../components/Modals/TransferTypeSelectionModal';
import TransferFormModal from '../../components/Modals/TransferFormModal';
import { FaDownload, FaSpinner } from 'react-icons/fa';

// Importă noile modale și constante
import BillPaymentProviderSelectionModal from '../../components/Modals/BillPaymentProviderSelectionModal';
import BillPaymentFormModal from '../../components/Modals/BillPaymentFormModal';
import { Biller } from '../../constants/billers'; // Importă tipul Biller

export type TransferType = 'own_account' | 'intrabank' | 'domestic_bank' | null;

const exchangeRatesToLEI: Record<string, number> = {
  'LEI': 1,
  'USD': 17.50,
  'EUR': 19.00,
};
const convertToLEI = (amount: number, currency: string): number => {
  return amount * (exchangeRatesToLEI[currency.toUpperCase()] || 0);
};

const MainContent = () => {
  const { selectedAccount } = useSelectedAccount();
  const { data: userAccounts, isLoading: isLoadingAccounts, isError: isErrorAccounts } = useGetUserDbAccountsQuery();

  // Stări pentru transferuri
  const [isTransferTypeModalOpen, setIsTransferTypeModalOpen] = useState(false);
  const [activeTransferForm, setActiveTransferForm] = useState<TransferType>(null);

  // Stări pentru plată facturi
  const [isBillProviderModalOpen, setIsBillProviderModalOpen] = useState(false);
  const [selectedBillerForPayment, setSelectedBillerForPayment] = useState<Biller | null>(null);

  // Stări pentru extras de cont
  const today = new Date().toISOString().split('T')[0];
  const [statementStartDate, setStatementStartDate] = useState<string>(today);
  const [statementEndDate, setStatementEndDate] = useState<string>(today);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [
    triggerDownloadStatement,
    { isLoading: isStatementDownloading, error: statementDownloadErrorObject }
  ] = useLazyDownloadAccountStatementQuery();

  // Efect pentru blur (actualizat)
  useEffect(() => {
    const anyModalOpen = isTransferTypeModalOpen || activeTransferForm || isBillProviderModalOpen || selectedBillerForPayment;
    // Sau mai generic: const anyModalOpen = !!document.querySelector('.modal-overlay');
    
    if (anyModalOpen) {
      document.body.classList.add('modal-open-blur');
    } else {
      document.body.classList.remove('modal-open-blur');
    }
    return () => {
      document.body.classList.remove('modal-open-blur');
    };
  }, [isTransferTypeModalOpen, activeTransferForm, isBillProviderModalOpen, selectedBillerForPayment]);

  // ... useEffect pentru statementDownloadErrorObject (neschimbat) ...
  useEffect(() => {
    if (statementDownloadErrorObject) {
        if ('data' in statementDownloadErrorObject && statementDownloadErrorObject.data && typeof statementDownloadErrorObject.data === 'object' && 'message' in statementDownloadErrorObject.data) {
            setDownloadError((statementDownloadErrorObject.data as { message: string }).message);
        } else if ('status' in statementDownloadErrorObject) {
             setDownloadError(`Eroare ${statementDownloadErrorObject.status} la descărcarea extrasului.`);
        } else {
            setDownloadError("A apărut o eroare necunoscută la descărcarea extrasului.");
        }
    } else {
        setDownloadError(null);
    }
  }, [statementDownloadErrorObject]);


  // Handlere pentru transferuri (neschimbate)
  const handleOpenTransferTypeModal = () => {
    setIsTransferTypeModalOpen(true);
    setActiveTransferForm(null);
  };
  const handleCloseTransferTypeModal = () => {
    setIsTransferTypeModalOpen(false);
  };
  const handleSelectTransferType = (type: TransferType) => {
    if (type) {
      setIsTransferTypeModalOpen(false);
      setActiveTransferForm(type);
    } else {
      setIsTransferTypeModalOpen(false);
      setActiveTransferForm(null);
    }
  };
  const handleCloseTransferFormModal = () => {
    setActiveTransferForm(null);
  };

  // Handlere noi pentru plată facturi
  const handleOpenBillPaymentModal = () => {
    setIsBillProviderModalOpen(true);
    setSelectedBillerForPayment(null); // Resetează orice furnizor selectat anterior
  };

  const handleCloseBillProviderModal = () => {
    setIsBillProviderModalOpen(false);
  };

  const handleSelectBillProvider = (biller: Biller) => {
    setIsBillProviderModalOpen(false); // Închide modalul de selecție
    setSelectedBillerForPayment(biller); // Deschide modalul de formular pentru acest furnizor
  };

  const handleCloseBillPaymentFormModal = () => {
    setSelectedBillerForPayment(null); // Închide modalul de formular
  };


  // ... formatBalanceDisplay, calculateTotalBalanceInLEI, logica display (neschimbate) ...
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

  // ... handleDownloadStatement (neschimbat) ...
  const handleDownloadStatement = async () => {
    if (!selectedAccount) {
      setDownloadError("Vă rugăm selectați un cont.");
      return;
    }
    if (!statementStartDate || !statementEndDate) {
      setDownloadError("Vă rugăm selectați perioada pentru extras.");
      return;
    }
    if (new Date(statementStartDate) > new Date(statementEndDate)) {
      setDownloadError("Data de început nu poate fi după data de sfârșit.");
      return;
    }
    
    setDownloadError(null);

    try {
      const blobResult = await triggerDownloadStatement({
        accountNumber: selectedAccount.accountNumber,
        startDate: statementStartDate,
        endDate: statementEndDate,
      }).unwrap();

      const url = window.URL.createObjectURL(blobResult);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `extras_cont_${selectedAccount.accountNumber}_${statementStartDate}_la_${statementEndDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error("Descărcare eșuată (catch în handler):", err);
    }
  };

  return (
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
            {/* Modifică butonul "Plată Facturi" */}
            <button className="action-btn payment" onClick={handleOpenBillPaymentModal}>
              <div className="action-btn-inner">
                <span className="action-icon">$</span>
                <span>Plată Facturi</span>
              </div>
            </button>
          </div>
        </section>

        {/* Secțiune Extras de Cont (neschimbată) */}
        {selectedAccount && (
          <section className="account-statement-card">
            <h3>Extras de Cont: <span className="statement-account-number">{selectedAccount.accountNumber}</span></h3>
            <div className="statement-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="statement-start-date">Data Început:</label>
                  <input
                    type="date"
                    id="statement-start-date"
                    value={statementStartDate}
                    onChange={(e) => setStatementStartDate(e.target.value)}
                    className="form-control"
                    max={today}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="statement-end-date">Data Sfârșit:</label>
                  <input
                    type="date"
                    id="statement-end-date"
                    value={statementEndDate}
                    onChange={(e) => {
                        setStatementEndDate(e.target.value);
                        if (new Date(e.target.value) < new Date(statementStartDate)) {
                            setStatementStartDate(e.target.value);
                        }
                    }}
                    className="form-control"
                    min={statementStartDate}
                    max={today}
                  />
                </div>
              </div>
              <button
                className="action-btn download-statement-btn"
                onClick={handleDownloadStatement}
                disabled={isStatementDownloading}
              >
                {isStatementDownloading ? (
                  <><FaSpinner className="spinner-icon" /> Se generează...</>
                ) : (
                  <><FaDownload /> Descarcă Extras PDF</>
                )}
              </button>
              {downloadError && <p className="error-message statement-error">{downloadError}</p>}
            </div>
          </section>
        )}

        <RecentTransactions
          selectedAccountNumber={selectedAccount?.accountNumber}
        />
      </div>

      {/* Modale pentru Transferuri (neschimbate) */}
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

      {/* Modale noi pentru Plată Facturi */}
      <BillPaymentProviderSelectionModal
        isOpen={isBillProviderModalOpen}
        onClose={handleCloseBillProviderModal}
        onSelectProvider={handleSelectBillProvider}
      />
      <BillPaymentFormModal
        isOpen={!!selectedBillerForPayment} // Se deschide dacă un furnizor e selectat
        onClose={handleCloseBillPaymentFormModal}
        selectedBiller={selectedBillerForPayment}
      />
    </main>
  );
};

export default MainContent;