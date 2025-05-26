// src/components/TransferForms/SepaPaymentForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { useGetUserDbAccountsQuery, useMakeSepaPaymentMutation } from '../../store/bankingApi'; // Ajustează calea
import { IDbAccountResponseDTO } from '../../entities/IDbAccountResponseDTO';
import { ISepaPaymentRequest } from '../../entities/ISepaPaymentRequest';
import { FaSpinner } from 'react-icons/fa';
import './TransferForms.css';

interface SepaPaymentFormProps {
  onCloseModal: () => void;
}

const SepaPaymentForm: React.FC<SepaPaymentFormProps> = ({ onCloseModal }) => {
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [beneficiaryName, setBeneficiaryName] = useState<string>('');
  const [beneficiaryIban, setBeneficiaryIban] = useState<string>('');
  const [beneficiaryBankBic, setBeneficiaryBankBic] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentDetails, setPaymentDetails] = useState<string>('');

  const [makeSepaPayment, { isLoading, isSuccess, reset: resetSepaMutation, isError, error: paymentError }] = useMakeSepaPaymentMutation();
  const { data: userAccounts, isLoading: isLoadingAccounts } = useGetUserDbAccountsQuery();
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isSuccess) {
      setFormMessage({ type: 'success', text: `Plata SEPA către ${beneficiaryName} a fost procesată cu succes!` });
      const timer = setTimeout(() => {
        setFromAccountId('');
        setBeneficiaryName('');
        setBeneficiaryIban('');
        setBeneficiaryBankBic('');
        setAmount('');
        setPaymentDetails('');
        resetSepaMutation();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, beneficiaryName, resetSepaMutation]);

  useEffect(() => {
     if (isError && paymentError) {
        const message = (paymentError as any)?.data?.message || (paymentError as any)?.error || 'A apărut o eroare la procesarea plății SEPA.';
        setFormMessage({ type: 'error', text: message });
    }
  }, [isError, paymentError]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage(null);
    resetSepaMutation();

    if (!fromAccountId || !beneficiaryName || !beneficiaryIban || !beneficiaryBankBic || !amount || !paymentDetails) {
        setFormMessage({ type: 'error', text: 'Toate câmpurile marcate cu * sunt obligatorii.' });
        return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        setFormMessage({ type: 'error', text: 'Suma trebuie să fie un număr pozitiv.' });
        return;
    }
    // Aici ai putea adăuga validări mai stricte pentru IBAN și BIC

    const requestData: ISepaPaymentRequest = {
      fromAccountId: parseInt(fromAccountId, 10),
      beneficiaryName,
      beneficiaryIban: beneficiaryIban.toUpperCase().replace(/\s/g, ''), // Normalizează IBAN
      beneficiaryBankBic: beneficiaryBankBic.toUpperCase().replace(/\s/g, ''), // Normalizează BIC
      amount: numericAmount,
      // currency: 'EUR', // Moneda este implicit EUR pentru SEPA, setată în backend
      paymentDetails,
    };

    try {
      await makeSepaPayment(requestData).unwrap();
    } catch (err) {
      console.error('SEPA payment failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="transfer-form">
      {formMessage && <div className={`form-message ${formMessage.type}-message`}>{formMessage.text}</div>}
      
      <div className="form-group">
        <label htmlFor="sepaFromAccount">Din contul: *</label>
        <select id="sepaFromAccount" value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)} required disabled={isLoadingAccounts || isLoading}>
          <option value="">Selectează contul...</option>
          {userAccounts?.map((acc: IDbAccountResponseDTO) => (
            <option key={acc.id} value={acc.id.toString()}>
              {acc.accountTypeName} ({acc.accountNumber}) - {acc.balance.toLocaleString('ro-MD')} {acc.currency}
            </option>
          ))}
        </select>
        {isLoadingAccounts && <small>Se încarcă conturile...</small>}
      </div>

      <div className="form-group">
        <label htmlFor="sepaBeneficiaryName">Nume Beneficiar: *</label>
        <input type="text" id="sepaBeneficiaryName" value={beneficiaryName} onChange={(e) => setBeneficiaryName(e.target.value)} required disabled={isLoading} />
      </div>

      <div className="form-group">
        <label htmlFor="sepaBeneficiaryIban">IBAN Beneficiar: *</label>
        <input type="text" id="sepaBeneficiaryIban" value={beneficiaryIban} onChange={(e) => setBeneficiaryIban(e.target.value)} required placeholder="Ex: DE89370400440532013000" disabled={isLoading} />
        <small>Trebuie să fie un IBAN dintr-o țară din zona SEPA.</small>
      </div>

      <div className="form-group">
        <label htmlFor="sepaBeneficiaryBankBic">BIC Bancă Beneficiar: *</label>
        <input type="text" id="sepaBeneficiaryBankBic" value={beneficiaryBankBic} onChange={(e) => setBeneficiaryBankBic(e.target.value)} required placeholder="Ex: COBADEFFXXX" disabled={isLoading} />
      </div>
      
      <div className="form-group">
        <label htmlFor="sepaAmount">Suma (EUR): *</label>
        <input type="number" id="sepaAmount" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01" placeholder="0.00" disabled={isLoading}/>
        <small>Plățile SEPA sunt procesate în EUR.</small>
      </div>

      <div className="form-group">
        <label htmlFor="sepaPaymentDetails">Detalii Plată (max 140 caractere): *</label>
        <textarea id="sepaPaymentDetails" value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)} required maxLength={140} rows={3} disabled={isLoading} />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCloseModal} disabled={isLoading}>Anulează</button>
        <button type="submit" className="btn btn-primary" disabled={isLoading || isSuccess}>
          {isLoading ? <><FaSpinner className="spinner-icon" /> Procesează...</> : 'Efectuează Plata SEPA'}
        </button>
      </div>
    </form>
  );
};

export default SepaPaymentForm;