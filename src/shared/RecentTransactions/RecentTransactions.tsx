// src/components/RecentTransactions/RecentTransactions.tsx
import React from 'react';
import { useGetAllUserTransactionsQuery, useGetTransactionsForUserAccountQuery } from '../../store/bankingApi';
import { IDbTransactionResponseDTO } from '../../entities/IDbTransactionResponseDTO';
import './RecentTransactions.css'; // Asigură-te că ai creat și stilizat acest fișier

interface RecentTransactionsProps {
  selectedAccountNumber?: string | null;
  selectedAccountCurrency?: string | null; // Adăugăm moneda contului selectat
}

const RecentTransactions = ({ selectedAccountNumber, selectedAccountCurrency }: RecentTransactionsProps) => {
  const skipGetAll = !!selectedAccountNumber;
  const skipGetForAccount = !selectedAccountNumber;

  const { 
    data: allTransactions, 
    isLoading: isLoadingAll, 
    isError: isErrorAll,
  } = useGetAllUserTransactionsQuery(undefined, { skip: skipGetAll });
  
  const { 
    data: accountTransactions, 
    isLoading: isLoadingAccount, 
    isError: isErrorAccount,
  } = useGetTransactionsForUserAccountQuery(selectedAccountNumber!, { skip: skipGetForAccount }); 

  const isLoading = isLoadingAll || isLoadingAccount;
  const isError = isErrorAll || isErrorAccount;
  const transactionsToDisplay: IDbTransactionResponseDTO[] | undefined = selectedAccountNumber ? accountTransactions : allTransactions;

  if (isLoading) return <div className="transactions-message">Se încarcă tranzacțiile...</div>;
  if (isError) return <div className="transactions-message transactions-error">Eroare la încărcarea tranzacțiilor.</div>;
  if (!transactionsToDisplay || transactionsToDisplay.length === 0) {
    return <div className="transactions-message">Nu există tranzacții recente.</div>;
  }

  const getTransactionTypeAndPeer = (tx: IDbTransactionResponseDTO) => {
    let type: 'income' | 'expense' = 'expense'; // Presupunem cheltuială default
    let peerAccountDisplay = "Extern"; // Contul "celălalt" din tranzacție

    // Dacă un cont specific este selectat, personalizăm descrierea
    if (selectedAccountNumber) {
      if (tx.toAccountNumber === selectedAccountNumber) {
        type = 'income';
        peerAccountDisplay = tx.fromAccountNumber || "Sursă Externă";
      } else if (tx.fromAccountNumber === selectedAccountNumber) {
        type = 'expense';
        peerAccountDisplay = tx.toAccountNumber || "Destinație Externă";
      } else {
        // Tranzacție care nu implică direct contul selectat, dar apare în lista lui (puțin probabil cu filtrarea curentă)
        // Sau o tranzacție internă între alte conturi ale userului (dacă selectedAccountNumber e null)
        // Pentru "Toate conturile", afișăm detaliile așa cum sunt.
        peerAccountDisplay = tx.toAccountNumber ? `către ${tx.toAccountNumber}` : (tx.fromAccountNumber ? `de la ${tx.fromAccountNumber}` : "Tranzacție internă/externă");
        if (tx.transactionType === 'DEPOSIT') type = 'income';
        // Poți adăuga mai multă logică aici bazată pe tx.transactionType dacă selectedAccountNumber este null
      }
    } else { // Pentru "Toate Tranzacțiile"
        if (tx.transactionType === 'DEPOSIT' || (tx.toAccountNumber && !tx.fromAccountNumber)) {
            type = 'income';
            peerAccountDisplay = tx.fromAccountNumber || "Sursă Externă";
        } else if (tx.transactionType === 'WITHDRAWAL' || (tx.fromAccountNumber && !tx.toAccountNumber)) {
            type = 'expense';
            peerAccountDisplay = tx.toAccountNumber || "Destinație Externă";
        } else if (tx.fromAccountNumber && tx.toAccountNumber) { // Transfer între conturi (posibil proprii)
            // Aici ai putea verifica dacă sunt conturi ale userului pentru a le marca diferit
            type = 'expense'; // Sau o clasă neutră 'transfer'
            peerAccountDisplay = `Transfer către ${tx.toAccountNumber}`;
        }
    }


    const description = tx.description || (type === 'income' ? `Încasare de la ${peerAccountDisplay}` : `Plată către ${peerAccountDisplay}`);
    
    return { type, description };
  };

  return (
    <section className="recent-transactions-card">
      <h3>
        {selectedAccountNumber 
          ? `Tranzacții Recente Cont ${selectedAccountNumber}` 
          : "Tranzacții Recente (Toate Conturile)"}
      </h3>
      <ul className="transactions-list">
        {transactionsToDisplay.map((tx: IDbTransactionResponseDTO) => {
          const { type, description } = getTransactionTypeAndPeer(tx);
          const amountPrefix = type === 'income' ? '+' : '-';
          // Afișăm moneda doar dacă un cont specific este selectat și avem moneda lui
          const currencyDisplay = selectedAccountNumber && selectedAccountCurrency ? selectedAccountCurrency : "";
          
          return (
            <li key={tx.id} className={`transaction-item ${type}`}>
              <div className="transaction-details">
                <span className="transaction-description">{description}</span>
                <span className="transaction-date">{new Date(tx.timestamp).toLocaleDateString('ro-RO')}</span>
              </div>
              <span className={`transaction-amount ${type}`}>
                {amountPrefix}
                {tx.amount.toLocaleString('ro-MD', {minimumFractionDigits:2, maximumFractionDigits:2})}
                {/* Afișăm moneda doar dacă este disponibilă (pentru cont selectat) */}
                {currencyDisplay && ` ${currencyDisplay}`}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default RecentTransactions;