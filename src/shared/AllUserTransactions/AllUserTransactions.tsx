import { useState, useMemo } from 'react';
import { useGetAllUserTransactionsQuery, useGetUserDbAccountsQuery } from '../../store/bankingApi'; // Ajustează calea
import { IDbTransactionResponseDTO } from '../../entities/IDbTransactionResponseDTO'; // Ajustează calea
import './AllUserTransactions.css'; // Vom crea acest fișier CSS
import { 
    FaArrowDown, FaArrowUp, FaExchangeAlt, 
    FaInfoCircle, FaTimes, FaDollarSign, FaSignOutAlt,
    FaUniversity, FaLandmark 
} from 'react-icons/fa';

// Componenta TransactionDetailModal poate fi aceeași ca cea definită în RecentTransactions.tsx
// Pentru a evita duplicarea, o poți muta într-un fișier separat, ex: src/components/Modals/TransactionDetailModal.tsx
// și să o imporți aici și în RecentTransactions.tsx.
// Pentru acest exemplu, o voi include din nou aici pentru completitudine.
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
        <div className="detail-row"><span className="label">ID:</span><span className="value">{transaction.id}</span></div>
        {transaction.fromAccountNumber && <div className="detail-row"><span className="label">Din Contul:</span><span className="value">{transaction.fromAccountNumber}</span></div>}
        {transaction.toAccountNumber && <div className="detail-row"><span className="label">Către Contul:</span><span className="value">{transaction.toAccountNumber}</span></div>}
        <div className="detail-row"><span className="label">Suma Tranzacționată:</span><span className="value">{transaction.amount.toLocaleString('ro-MD')} {transaction.currency}</span></div>
        {conversionDetails && <div className="detail-row"><span className="label">Detalii Conversie:</span><span className="value">{conversionDetails}</span></div>}
        <div className="detail-row"><span className="label">Tip Operațiune Specific:</span><span className="value">{transaction.transactionType || 'N/A'}</span></div>
        <div className="detail-row"><span className="label">Descriere Completă:</span><span className="value">{transaction.description || 'Fără descriere'}</span></div>
        <div className="detail-row"><span className="label">Data și Ora:</span><span className="value">{formatDate(transaction.timestamp)}</span></div>
      </div>
    </div>
  );
};


const AllUserTransactions = () => {
  const [selectedTransactionForModal, setSelectedTransactionForModal] = useState<IDbTransactionResponseDTO | null>(null);

  // Preluăm conturile utilizatorului pentru a determina direcția transferurilor
  const { data: userAccountsData, isLoading: isLoadingUserAccounts } = useGetUserDbAccountsQuery();
  const userAccountNumbers = useMemo(() => userAccountsData?.map(acc => acc.accountNumber) || [], [userAccountsData]);

  // Preluăm TOATE tranzacțiile utilizatorului
  const { 
    data: rawTransactions, 
    isLoading: isLoadingAllTransactions, 
    isError, 
    error 
  } = useGetAllUserTransactionsQuery(undefined, {
    skip: isLoadingUserAccounts, // Așteaptă încărcarea conturilor userului
  });

  const isLoading = isLoadingAllTransactions || isLoadingUserAccounts;

  if (isLoading) return <div className="transactions-message loading">Se încarcă istoricul tranzacțiilor...</div>;
  if (isError) {
    console.error("Eroare la încărcarea tuturor tranzacțiilor:", error);
    return <div className="transactions-message transactions-error">Eroare la încărcarea istoricului tranzacțiilor.</div>;
  }
  
  // Sortăm tranzacțiile descrescător după timestamp (cele mai noi primele)
  // Nu mai aplicăm .slice() pentru a limita numărul
  const transactionsToDisplay = rawTransactions
    ?.slice() 
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (!transactionsToDisplay || transactionsToDisplay.length === 0) {
    return <div className="transactions-message">Nu aveți tranzacții înregistrate.</div>;
  }

  // Funcția getTransactionDisplayInfo este similară cu cea din RecentTransactions,
  // dar adaptată pentru contextul "toate conturile"
  const getTransactionDisplayInfo = (tx: IDbTransactionResponseDTO) => {
    let visualType: 'income' | 'expense' | 'internal' | 'neutral' = 'neutral';
    let conciseDescription = tx.description || "Tranzacție";
    let icon = <FaInfoCircle />;
    
    const isFromOneOfMyKnownAccounts = tx.fromAccountNumber && userAccountNumbers.includes(tx.fromAccountNumber);
    const isToOneOfMyKnownAccounts = tx.toAccountNumber && userAccountNumbers.includes(tx.toAccountNumber);

    switch (tx.transactionType) {
        case 'OWN_ACCOUNT_TRANSFER':
            visualType = 'internal'; icon = <FaExchangeAlt />;
            conciseDescription = `Transfer între conturi`;
            break;
        case 'DEPOSIT':
            visualType = 'income'; icon = <FaDollarSign />;
            conciseDescription = tx.toAccountNumber ? `Depunere în ${tx.toAccountNumber}` : 'Depunere';
            break;
        case 'WITHDRAWAL':
            visualType = 'expense'; icon = <FaSignOutAlt />;
            conciseDescription = tx.fromAccountNumber ? `Retragere din ${tx.fromAccountNumber}` : 'Retragere';
            break;
        case 'INTRABANK_TRANSFER_SENT':
        case 'DOMESTIC_BANK_TRANSFER_SENT':
        case 'INTRABANK_TRANSFER': 
        case 'DOMESTIC_BANK_TRANSFER':
            if (isFromOneOfMyKnownAccounts) {
                visualType = 'expense';
                icon = tx.transactionType.includes('INTRABANK') ? <FaUniversity /> : <FaLandmark />;
                let recipientInfo = tx.toAccountNumber;
                if (!recipientInfo && tx.description) {
                    const ibanMatch = tx.description.match(/IBAN (\S+)/);
                    if (ibanMatch?.[1]) recipientInfo = ibanMatch[1];
                    else recipientInfo = tx.description.match(/Beneficiar: ([^,)]+)/)?.[1] || 'destinatar';
                } else if (!recipientInfo) { recipientInfo = 'destinatar extern'; }
                conciseDescription = `Transfer către ${recipientInfo}`;
            } else if (isToOneOfMyKnownAccounts) {
                visualType = 'income';
                icon = tx.transactionType.includes('INTRABANK') ? <FaUniversity /> : <FaLandmark />;
                conciseDescription = `Încasare de la ${tx.fromAccountNumber || 'expeditor extern'}`;
            } else {
                conciseDescription = tx.description || "Transfer extern";
            }
            break;
        case 'INTRABANK_TRANSFER_RECEIVED': 
        case 'DOMESTIC_BANK_TRANSFER_RECEIVED':
            visualType = 'income'; 
            icon = tx.transactionType.includes('INTRABANK') ? <FaUniversity /> : <FaLandmark />;
            conciseDescription = `Încasare de la ${tx.fromAccountNumber || 'expeditor extern'}`;
            break;
        default: 
            if (isToOneOfMyKnownAccounts && !isFromOneOfMyKnownAccounts) visualType = 'income';
            else if (isFromOneOfMyKnownAccounts && !isToOneOfMyKnownAccounts) visualType = 'expense';
            icon = visualType === 'income' ? <FaArrowDown /> : visualType === 'expense' ? <FaArrowUp /> : <FaInfoCircle />;
            if (!tx.description && visualType !== 'neutral') {
                conciseDescription = visualType === 'income' ? `Creditare cont` : `Debitare cont`;
            } else if (!tx.description && visualType === 'neutral') {
                 conciseDescription = "Operațiune";
            } else {
                conciseDescription = tx.description || "Operațiune";
            }
            break;
      }
    
    const mainDescPart = conciseDescription.split('(Suma originală:')[0].trim();
    if (mainDescPart.length > 60) { // Permitem o descriere puțin mai lungă aici
        conciseDescription = mainDescPart.substring(0, 57) + "...";
    } else {
        conciseDescription = mainDescPart;
    }

    return { visualType, conciseDescription, icon };
  };

  return (
    <>
      <div className="all-transactions-container"> {/* Clasă container specifică */}
        {/* Aici ai putea adăuga filtre de dată, tip, sumă etc. în viitor */}
        {transactionsToDisplay.length > 0 ? (
          <ul className="transactions-list">
            {transactionsToDisplay.map((tx: IDbTransactionResponseDTO) => {
              const { visualType, conciseDescription, icon } = getTransactionDisplayInfo(tx);
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
                      {new Date(tx.timestamp).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(tx.timestamp).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit'})}
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
        ) : (
          <div className="transactions-message">Nu există tranzacții de afișat.</div>
        )}
      </div>

      {selectedTransactionForModal && (
        <TransactionDetailModal 
          transaction={selectedTransactionForModal} 
          onClose={() => setSelectedTransactionForModal(null)} 
        />
      )}
    </>
  );
};

export default AllUserTransactions;