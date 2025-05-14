import React, { useState } from 'react';
import './RecentTransactions.css';

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
}

interface TransactionPopupProps {
  transaction: Transaction;
  onClose: () => void;
}

const TransactionPopup: React.FC<TransactionPopupProps> = ({ transaction, onClose }) => (
  <div className="popup-overlay" onClick={onClose}>
    <div className="transaction-popup" onClick={(e) => e.stopPropagation()}>
      <button className="close-btn" onClick={onClose}>&times;</button>
      <h3>Detalii Tranzacție</h3>
      <div className="transaction-details">
        <div className="detail-row">
          <span>Data:</span>
          <span>{new Date(transaction.date).toLocaleDateString()}</span>
        </div>
        <div className="detail-row">
          <span>Descriere:</span>
          <span>{transaction.description}</span>
        </div>
        <div className="detail-row">
          <span>Suma:</span>
          <span className={`amount ${transaction.type}`}>
            {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const RecentTransactions = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const transactions: Transaction[] = [
    {
      id: 1,
      date: '2024-03-15',
      description: 'Salary Deposit',
      amount: 4500.00,
      type: 'credit'
    },
    {
      id: 2,
      date: '2024-03-14',
      description: 'Utility Payment',
      amount: 230.50,
      type: 'debit'
    }
  ];

  return (
    <section className="transactions-section">
      <h3>Recent Transactions</h3>
      <div className="transactions-list">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className={`transaction-item ${transaction.type}`}
            onClick={() => setSelectedTransaction(transaction)}
          >
            <div className="transaction-info">
              <span>{transaction.description}</span>
              <span className={`amount ${transaction.type}`}>
                {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
              </span>
            </div>
            <span className="transaction-date">
              {new Date(transaction.date).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>

      {selectedTransaction && (
        <TransactionPopup
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </section>
  );
};

export default RecentTransactions;