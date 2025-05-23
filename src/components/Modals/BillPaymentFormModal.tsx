// src/components/Modals/BillPaymentFormModal.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { Biller, BillerField } from '../../constants/billers';
import { useGetUserDbAccountsQuery, useMakeBillPaymentMutation } from '../../store/bankingApi';
import { IDbAccountResponseDTO } from '../../entities/IDbAccountResponseDTO';
import { IBillPaymentRequestDTO } from '../../entities/IBillPaymentRequestDTO';
import { FaSpinner } from 'react-icons/fa';
import './BillPaymentModals.css';

interface BillPaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBiller: Biller | null;
}

const BillPaymentFormModal: React.FC<BillPaymentFormModalProps> = ({
  isOpen,
  onClose,
  selectedBiller,
}) => {
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>(selectedBiller?.defaultAmount?.toString() || '');
  const [currency, setCurrency] = useState<string>('LEI'); // Default LEI
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>({});
  const [userDescription, setUserDescription] = useState<string>('');

  const [makeBillPayment, { isLoading: isPaying, isSuccess, isError, error: paymentError }] = useMakeBillPaymentMutation();
  const { data: userAccounts, isLoading: isLoadingAccounts } = useGetUserDbAccountsQuery();

  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Reset form when modal is opened/closed or biller changes
    if (isOpen && selectedBiller) {
      setFromAccountId('');
      setAmount(selectedBiller.defaultAmount?.toString() || '');
      setCurrency('LEI');
      const initialDetails: Record<string, string> = {};
      selectedBiller.fields.forEach(field => initialDetails[field.name] = '');
      setPaymentDetails(initialDetails);
      setUserDescription('');
      setFormMessage(null);
    }
  }, [isOpen, selectedBiller]);
  
  useEffect(() => {
    if (isSuccess) {
        setFormMessage({ type: 'success', text: `Plata către ${selectedBiller?.name} a fost procesată cu succes!` });
        // setTimeout(onClose, 3000); // Opțional, închide după un delay
    }
  }, [isSuccess, selectedBiller?.name, onClose]);

  useEffect(() => {
    if (isError && paymentError) {
        if ('data' in paymentError && paymentError.data && typeof paymentError.data === 'object' && 'message' in paymentError.data) {
            setFormMessage({ type: 'error', text: (paymentError.data as { message: string }).message });
        } else if ('status' in paymentError) {
            setFormMessage({ type: 'error', text: `Eroare ${paymentError.status} la procesarea plății.`});
        }
         else {
            setFormMessage({ type: 'error', text: 'A apărut o eroare necunoscută la procesarea plății.' });
        }
    }
  }, [isError, paymentError]);


  const handleDetailChange = (fieldName: string, value: string) => {
    setPaymentDetails((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage(null);

    if (!selectedBiller || !fromAccountId) {
      setFormMessage({ type: 'error', text: 'Vă rugăm selectați un cont și asigurați-vă că un furnizor este ales.' });
      return;
    }
    if (parseFloat(amount) <= 0) {
        setFormMessage({ type: 'error', text: 'Suma trebuie să fie mai mare ca zero.' });
        return;
    }

    const requestData: IBillPaymentRequestDTO = {
      fromAccountId: parseInt(fromAccountId, 10),
      providerKey: selectedBiller.key,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      paymentDetails,
      description: userDescription,
    };

    try {
      await makeBillPayment(requestData).unwrap();
      // Mesajul de succes este gestionat de useEffect pe isSuccess
    } catch (err) {
      // Mesajul de eroare este gestionat de useEffect pe isError
      console.error('Bill payment failed:', err);
    }
  };

  if (!isOpen || !selectedBiller) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-form-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ×
        </button>
        <h2>Plată Factură: {selectedBiller.name}</h2>

        {formMessage && (
            <div className={`form-message ${formMessage.type === 'success' ? 'success-message' : 'error-message'}`}>
                {formMessage.text}
            </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fromAccount">Plătește din contul:</label>
            <select
              id="fromAccount"
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              required
              disabled={isLoadingAccounts}
            >
              <option value="">Selectează contul...</option>
              {userAccounts?.map((acc: IDbAccountResponseDTO) => (
                <option key={acc.id} value={acc.id.toString()}>
                  {acc.accountTypeName} ({acc.accountNumber}) - {acc.balance.toLocaleString('ro-MD')} {acc.currency}
                </option>
              ))}
            </select>
            {isLoadingAccounts && <small>Se încarcă conturile...</small>}
          </div>

          {selectedBiller.fields.map((field: BillerField) => (
            <div className="form-group" key={field.name}>
              <label htmlFor={`detail-${field.name}`}>{field.label}:</label>
              <input
                type={field.type}
                id={`detail-${field.name}`}
                value={paymentDetails[field.name] || ''}
                onChange={(e) => handleDetailChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                pattern={field.pattern}
                minLength={field.minLength}
                maxLength={field.maxLength}
              />
            </div>
          ))}

          <div className="form-group">
            <label htmlFor="amount">Suma:</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="paymentCurrency">Moneda Plății:</label>
            <input
              type="text"
              id="paymentCurrency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              maxLength={3}
              placeholder="LEI"
              required
            />
             <small>Implicit: LEI. Contul sursă va fi debitat în moneda sa, cu conversie dacă e necesar.</small>
          </div>

          <div className="form-group">
            <label htmlFor="userDescription">Descriere plată (opțional):</label>
            <input
              type="text"
              id="userDescription"
              value={userDescription}
              onChange={(e) => setUserDescription(e.target.value)}
              placeholder="Ex: Factura luna Mai"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isPaying}>
              Anulează
            </button>
            <button type="submit" className="btn btn-primary" disabled={isPaying || isSuccess}>
              {isPaying ? <><FaSpinner className="spinner-icon" /> Plătește...</> : 'Confirmă Plata'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillPaymentFormModal;