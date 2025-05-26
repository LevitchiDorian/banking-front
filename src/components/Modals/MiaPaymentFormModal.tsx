// src/components/Modals/MiaPaymentFormModal.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { useGetUserDbAccountsQuery, useMakeMiaPaymentMutation } from '../../store/bankingApi';
import { IDbAccountResponseDTO } from '../../entities/IDbAccountResponseDTO';
import { IMiaPaymentRequest } from '../../entities/IMiaPaymentRequest'; // Folosește noul tip
import { FaSpinner } from 'react-icons/fa';
import './TransferModals.css'; // Folosește CSS-ul comun

interface MiaPaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MiaPaymentFormModal: React.FC<MiaPaymentFormModalProps> = ({ isOpen, onClose }) => {
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [beneficiaryPhoneNumber, setBeneficiaryPhoneNumber] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [makeMiaPayment, { isLoading, isSuccess, isError, error: paymentError }] = useMakeMiaPaymentMutation();
  const { data: userAccounts, isLoading: isLoadingAccounts } = useGetUserDbAccountsQuery();
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset form fields
      setFromAccountId('');
      setBeneficiaryPhoneNumber('');
      setAmount('');
      setDescription('');
      setFormMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isSuccess) {
        setFormMessage({ type: 'success', text: `Plata MIA către ${beneficiaryPhoneNumber} a fost procesată cu succes!` });
        // setTimeout(onClose, 3000);
    }
  }, [isSuccess, beneficiaryPhoneNumber, onClose]);

  useEffect(() => {
    if (isError && paymentError) {
        if ('data' in paymentError && paymentError.data && typeof paymentError.data === 'object' && 'message' in paymentError.data) {
            setFormMessage({ type: 'error', text: (paymentError.data as { message: string }).message });
        } else if ('status' in paymentError) {
            setFormMessage({ type: 'error', text: `Eroare ${paymentError.status} la procesarea plății MIA.`});
        } else {
            setFormMessage({ type: 'error', text: 'A apărut o eroare necunoscută la procesarea plății MIA.' });
        }
    }
  }, [isError, paymentError]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage(null);
    if (!fromAccountId || !beneficiaryPhoneNumber || !amount) {
        setFormMessage({ type: 'error', text: 'Toate câmpurile marcate sunt obligatorii.' });
        return;
    }
    if (parseFloat(amount) <= 0) {
        setFormMessage({ type: 'error', text: 'Suma trebuie să fie pozitivă.' });
        return;
    }

    const requestData: IMiaPaymentRequest = {
      fromAccountId: parseInt(fromAccountId, 10),
      beneficiaryPhoneNumber,
      amount: parseFloat(amount),
      currency: 'LEI', // MIA este implicit în LEI
      description: description || undefined,
    };

    try {
      await makeMiaPayment(requestData).unwrap();
    } catch (err) {
      console.error('MIA payment failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content mia-payment-form-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h2>Plată Instantanee Națională (MIA)</h2>
        {formMessage && <div className={`form-message ${formMessage.type}-message`}>{formMessage.text}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="miaFromAccount">Din contul:</label>
            <select id="miaFromAccount" value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)} required disabled={isLoadingAccounts}>
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
            <label htmlFor="miaBeneficiaryPhone">Număr Telefon Beneficiar:</label>
            <input type="tel" id="miaBeneficiaryPhone" value={beneficiaryPhoneNumber} onChange={(e) => setBeneficiaryPhoneNumber(e.target.value)} required placeholder="+373xxxxxxxx sau 0xxxxxxx" />
          </div>
          <div className="form-group">
            <label htmlFor="miaAmount">Suma (LEI):</label>
            <input type="number" id="miaAmount" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01" />
          </div>
          <div className="form-group">
            <label htmlFor="miaDescription">Descriere (opțional):</label>
            <input type="text" id="miaDescription" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={140} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>Anulează</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading || isSuccess}>
              {isLoading ? <><FaSpinner className="spinner-icon" /> Procesează...</> : 'Efectuează Plata MIA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default MiaPaymentFormModal;