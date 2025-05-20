import React, { useState, useMemo } from 'react';
import { 
    useGetAllUserTransactionsQuery, 
    useGetTransactionsForUserAccountQuery,
    useGetUserDbAccountsQuery
} from '../../store/bankingApi';
import { IDbTransactionResponseDTO } from '../../entities/IDbTransactionResponseDTO';
import './RecentTransactions.css';
import { 
    FaArrowDown, FaArrowUp, FaExchangeAlt, 
    FaInfoCircle, FaTimes, FaDollarSign, FaSignOutAlt,
    FaUniversity, FaLandmark 
} from 'react-icons/fa';

interface RecentTransactionsProps {
  selectedAccountNumber?: string | null;
}

const MAX_TRANSACTIONS_TO_DISPLAY = 3;

const TransactionDetailModal = ({ transaction, onClose }: { transaction: IDbTransactionResponseDTO, onClose: () => void }) => {
  if (!transaction) return null;

  const formatDate = (isoDate: string) => new Date(isoDate).toLocaleString('ro-RO', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  
  const descriptionParts = transaction.description?.split('(Suma originală:');
  const mainDescriptionFromTx = descriptionParts?.[0]?.trim() || 'Fără descriere specifică';
  let conversionDetails = null;
  if (descriptionParts && descriptionParts.length > 1) {
    conversionDetails = `(Suma originală:${descriptionParts[1]}`;
  }

  return (
    <div className="transaction-detail-modal-overlay" onClick={onClose}>
      <div className="transaction-detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="transaction-detail-modal-close-btn" onClick={onClose} aria-label="Închide"><FaTimes /></button>
        <h4>Detalii Tranzacție</h4>
        {transaction.fromAccountNumber && <div className="detail-row"><span className="label">Din Contul:</span><span className="value">{transaction.fromAccountNumber}</span></div>}
        {transaction.toAccountNumber && <div className="detail-row"><span className="label">Către Contul:</span><span className="value">{transaction.toAccountNumber}</span></div>}
        <div className="detail-row"><span className="label">Suma Tranzacționată:</span><span className="value">{transaction.amount.toLocaleString('ro-MD')} {transaction.currency}</span></div>
        {conversionDetails && <div className="detail-row"><span className="label">Detalii Conversie:</span><span className="value">{conversionDetails}</span></div>}
        <div className="detail-row"><span className="label">Tip Operațiune Specific:</span><span className="value">{transaction.transactionType || 'N/A'}</span></div>
        <div className="detail-row"><span className="label">Data și Ora:</span><span className="value">{formatDate(transaction.timestamp)}</span></div>
      </div>
    </div>
  );
};

const RecentTransactions = ({ selectedAccountNumber }: RecentTransactionsProps) => {
  const [selectedTransactionForModal, setSelectedTransactionForModal] = useState<IDbTransactionResponseDTO | null>(null);

  const { data: userAccountsData, isLoading: isLoadingUserAccounts } = useGetUserDbAccountsQuery();
  const userAccountNumbers = useMemo(() => userAccountsData?.map(acc => acc.accountNumber) || [], [userAccountsData]);

  const getAllTransactionsResult = useGetAllUserTransactionsQuery(undefined, { 
    skip: !!selectedAccountNumber || isLoadingUserAccounts,
  });
  
  const getAccountTransactionsResult = useGetTransactionsForUserAccountQuery(selectedAccountNumber!, { 
    skip: !selectedAccountNumber || isLoadingUserAccounts,
  });

  const isLoading = selectedAccountNumber ? getAccountTransactionsResult.isLoading : getAllTransactionsResult.isLoading || isLoadingUserAccounts;
  const isError = selectedAccountNumber ? getAccountTransactionsResult.isError : getAllTransactionsResult.isError;
  const error = selectedAccountNumber ? getAccountTransactionsResult.error : getAllTransactionsResult.error;
  const rawTransactions = selectedAccountNumber ? getAccountTransactionsResult.data : getAllTransactionsResult.data;

  if (isLoading) return <div className="transactions-message loading">Se încarcă tranzacțiile...</div>;
  if (isError) {
    console.error("Eroare la încărcarea tranzacțiilor:", error);
    return <div className="transactions-message transactions-error">Eroare la încărcarea tranzacțiilor.</div>;
  }
  
  const transactionsToDisplay = rawTransactions
    ?.slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, MAX_TRANSACTIONS_TO_DISPLAY);

  if (!transactionsToDisplay || transactionsToDisplay.length === 0) {
    return <div className="transactions-message">Nu există tranzacții recente.</div>;
  }

  const getTransactionDisplayInfo = (tx: IDbTransactionResponseDTO, currentSelectedAccNum?: string | null) => {
    let visualType: 'income' | 'expense' | 'internal' | 'neutral' = 'neutral';
    let conciseDescription = tx.description || "Tranzacție";
    let icon = <FaInfoCircle />;

    const isFromCurrentSelected = tx.fromAccountNumber === currentSelectedAccNum;
    const isToCurrentSelected = tx.toAccountNumber === currentSelectedAccNum;
    
    const isFromOneOfMyKnownAccounts = tx.fromAccountNumber && userAccountNumbers.includes(tx.fromAccountNumber);
    const isToOneOfMyKnownAccounts = tx.toAccountNumber && userAccountNumbers.includes(tx.toAccountNumber);

    if (currentSelectedAccNum) { // --- CAZ: Un cont specific este selectat ---
      if (tx.transactionType?.includes('OWN_ACCOUNT_TRANSFER')) {
        visualType = 'internal'; icon = <FaExchangeAlt />;
        conciseDescription = isToCurrentSelected 
            ? `De la ${tx.fromAccountNumber || 'cont propriu'}` 
            : `Către ${tx.toAccountNumber || 'cont propriu'}`;
      } else if (isToCurrentSelected) {
        visualType = 'income'; icon = <FaArrowDown />;
        conciseDescription = `Încasare de la ${tx.fromAccountNumber || 'sursă externă'}`;
      } else if (isFromCurrentSelected) {
        visualType = 'expense'; icon = <FaArrowUp />;
        conciseDescription = `Plată către ${tx.toAccountNumber || 'destinație externă'}`;
      } else { 
        conciseDescription = tx.description || `Operațiune pe cont`;
        // Pentru comisioane/dobânzi pe contul selectat, ideal ar fi un transactionType specific
        // sau backend-ul să indice credit/debit explicit pentru contul selectat.
        // Aici, dacă nu e sursă/destinație, ramâne 'neutral' dacă nu avem alte indicii.
      }
    } else { // --- CAZ: Toate Conturile (Niciun cont specific selectat) ---
      switch (tx.transactionType) {
        case 'OWN_ACCOUNT_TRANSFER':
          visualType = 'internal'; 
          icon = <FaExchangeAlt />;
          conciseDescription = `Transfer între conturi`;
          break;
        case 'DEPOSIT':
          visualType = 'income'; 
          icon = <FaDollarSign />;
          conciseDescription = tx.toAccountNumber ? `Depunere în ${tx.toAccountNumber}` : 'Depunere';
          break;
        case 'WITHDRAWAL':
          visualType = 'expense'; 
          icon = <FaSignOutAlt />;
          conciseDescription = tx.fromAccountNumber ? `Retragere din ${tx.fromAccountNumber}` : 'Retragere';
          break;
        
        // Pentru tipurile trimise (SENT), ele sunt întotdeauna 'expense' din perspectiva utilizatorului
        case 'INTRABANK_TRANSFER_SENT':
        case 'DOMESTIC_BANK_TRANSFER_SENT':
          visualType = 'expense'; 
          icon = tx.transactionType === 'INTRABANK_TRANSFER_SENT' ? <FaUniversity /> : <FaLandmark />;
          let recipientInfoSent = tx.toAccountNumber;
          if (!recipientInfoSent && tx.description) {
              const ibanMatch = tx.description.match(/IBAN (\S+)/);
              if (ibanMatch?.[1]) recipientInfoSent = ibanMatch[1];
              else recipientInfoSent = tx.description.match(/Beneficiar: ([^,)]+)/)?.[1] || 'destinatar';
          } else if (!recipientInfoSent) {
              recipientInfoSent = 'destinatar extern';
          }
          conciseDescription = `Transfer către ${recipientInfoSent}`;
          break;

        // Pentru tipurile primite (RECEIVED), ele sunt întotdeauna 'income'
        // Acestea trebuie setate de backend când utilizatorul este beneficiarul.
        case 'INTRABANK_TRANSFER_RECEIVED':
        case 'DOMESTIC_BANK_TRANSFER_RECEIVED':
          visualType = 'income'; 
          icon = tx.transactionType === 'INTRABANK_TRANSFER_RECEIVED' ? <FaUniversity /> : <FaLandmark />;
          conciseDescription = `Încasare de la ${tx.fromAccountNumber || 'expeditor extern'}`;
          break;

        // Fallback pentru tipuri generice de transfer, dacă backend-ul nu distinge SENT/RECEIVED
        // dar include tranzacțiile unde utilizatorul este destinatar.
        case 'INTRABANK_TRANSFER':
        case 'DOMESTIC_BANK_TRANSFER':
          if (isFromOneOfMyKnownAccounts) { // Eu am inițiat, deci e cheltuială
            visualType = 'expense';
            icon = tx.transactionType === 'INTRABANK_TRANSFER' ? <FaUniversity /> : <FaLandmark />;
            let recipientInfoGeneric = tx.toAccountNumber;
            if (!recipientInfoGeneric && tx.description) { // Încercăm să extragem din descriere
                const ibanMatch = tx.description.match(/IBAN (\S+)/);
                if (ibanMatch?.[1]) recipientInfoGeneric = ibanMatch[1];
                else recipientInfoGeneric = tx.description.match(/Beneficiar: ([^,)]+)/)?.[1] || 'destinatar';
            } else if (!recipientInfoGeneric) {
                recipientInfoGeneric = 'destinatar extern';
            }
            conciseDescription = `Transfer către ${recipientInfoGeneric}`;
          } else if (isToOneOfMyKnownAccounts) { // Am primit, deci e venit
            visualType = 'income';
            icon = tx.transactionType === 'INTRABANK_TRANSFER' ? <FaUniversity /> : <FaLandmark />;
            conciseDescription = `Încasare de la ${tx.fromAccountNumber || 'expeditor extern'}`;
          } else {
            // Caz neașteptat dacă tranzacția e returnată dar nu implică conturile userului
            conciseDescription = tx.description || "Transfer extern";
            icon = <FaInfoCircle />;
            visualType = 'neutral';
          }
          break;

        default: 
            if (isToOneOfMyKnownAccounts && !isFromOneOfMyKnownAccounts) { // Clar income
                visualType = 'income'; icon = <FaArrowDown />;
            } else if (isFromOneOfMyKnownAccounts && !isToOneOfMyKnownAccounts) { // Clar expense
                visualType = 'expense'; icon = <FaArrowUp />;
            }
            // Păstrăm descrierea din BD dacă există și tipul nu e clar income/expense
            if (!tx.description || visualType === 'neutral') {
                 conciseDescription = visualType === 'income' ? `Creditare cont` : 
                                     visualType === 'expense' ? `Debitare cont` : "Operațiune";
            } else {
                conciseDescription = tx.description;
            }
            break;
      }
    }
    
    // Trunchierea finală a descrierii
    const mainDescPart = conciseDescription.split('(Suma originală:')[0].trim();
    if (mainDescPart.length > 45) {
        conciseDescription = mainDescPart.substring(0, 42) + "...";
    } else {
        conciseDescription = mainDescPart;
    }

    return { visualType, conciseDescription, icon };
  };

  return (
    <>
      <section className="recent-transactions-card">
        <h3>
          {selectedAccountNumber 
            ? `Ultimele Tranzacții (Cont ${selectedAccountNumber})` 
            : `Ultimele ${transactionsToDisplay.length} Tranzacții`}
        </h3>
        <ul className="transactions-list">
          {transactionsToDisplay.map((tx: IDbTransactionResponseDTO) => {
            const { visualType, conciseDescription, icon } = getTransactionDisplayInfo(tx, selectedAccountNumber);
            const amountPrefix = visualType === 'income' ? '+' : (visualType === 'expense' ? '-' : '');
            
            return (
              <li 
                key={tx.id} 
                className={`transaction-item transaction-${visualType}`}
                onClick={() => setSelectedTransactionForModal(tx)}
                role="button" tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && setSelectedTransactionForModal(tx)}
              >
                <div className={`transaction-type-icon ${visualType}`}>{icon}</div>
                <div className="transaction-details">
                  <span className="transaction-description">{conciseDescription}</span>
                  <span className="transaction-date">
                    {new Date(tx.timestamp).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}, {new Date(tx.timestamp).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit'})}
                  </span>
                </div>
                <div className="transaction-amount-details">
                  <span className={`transaction-amount amount-${visualType}`}>
                    {amountPrefix}
                    {tx.amount.toLocaleString('ro-MD', {minimumFractionDigits:2, maximumFractionDigits:2})}
                  </span>
                  {tx.currency && <span className="transaction-currency">{tx.currency}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {selectedTransactionForModal && (
        <TransactionDetailModal 
          transaction={selectedTransactionForModal} 
          onClose={() => setSelectedTransactionForModal(null)} 
        />
      )}
    </>
  );
};

export default RecentTransactions;