// src/components/TransferForms/MiaPaymentForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { useGetUserDbAccountsQuery, useMakeMiaPaymentMutation } from '../../store/bankingApi'; // Ajustează calea
import { IDbAccountResponseDTO } from '../../entities/IDbAccountResponseDTO';
import { IMiaPaymentRequest } from '../../entities/IMiaPaymentRequest';
import { FaSpinner } from 'react-icons/fa';
import './TransferForms.css';

// Asigură-te că CSS-ul relevant (Modals.css sau TransferModals.css) este importat unde este nevoie
// de obicei în componenta părinte care randează modalul (ex: TransferFormModal.tsx)
// sau la nivel global în App.tsx. Nu este nevoie de import direct aici dacă stilurile sunt globale.

interface MiaPaymentFormProps {
  onCloseModal: () => void; // Funcție pentru a închide modalul părinte
}

const MiaPaymentForm: React.FC<MiaPaymentFormProps> = ({ onCloseModal }) => {
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [beneficiaryPhoneNumber, setBeneficiaryPhoneNumber] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [makeMiaPayment, { isLoading, isSuccess, reset: resetMiaMutation, isError, error: paymentError }] = useMakeMiaPaymentMutation();
  const { data: userAccounts, isLoading: isLoadingAccounts } = useGetUserDbAccountsQuery();
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Reset form if the success state changes (e.g., after a successful payment)
    if (isSuccess) {
      setFormMessage({ type: 'success', text: `Plata MIA către ${beneficiaryPhoneNumber} a fost procesată cu succes!` });
      // Nu reseta câmpurile imediat pentru ca utilizatorul să vadă mesajul.
      // Resetarea se poate face la închiderea modalului sau la o nouă deschidere.
      // Sau, resetează după un delay dacă modalul rămâne deschis:
      const timer = setTimeout(() => {
        setFromAccountId('');
        setBeneficiaryPhoneNumber('');
        setAmount('');
        setDescription('');
        resetMiaMutation(); // Resetează starea mutației RTK Query
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, beneficiaryPhoneNumber, resetMiaMutation]);

  useEffect(() => {
    if (isError && paymentError) {
        const message = (paymentError as any)?.data?.message || (paymentError as any)?.error || 'A apărut o eroare la procesarea plății MIA.';
        setFormMessage({ type: 'error', text: message });
    }
  }, [isError, paymentError]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage(null); // Resetează mesajele anterioare
    resetMiaMutation(); // Resetează starea mutației înainte de un nou submit

    if (!fromAccountId || !beneficiaryPhoneNumber || !amount) {
        setFormMessage({ type: 'error', text: 'Toate câmpurile marcate cu * sunt obligatorii.' });
        return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        setFormMessage({ type: 'error', text: 'Suma trebuie să fie un număr pozitiv.' });
        return;
    }
    // Validare simplă număr telefon (poate fi îmbunătățită)
    const phoneRegex = /^\+?373[0-9]{8}$|^0[0-9]{8}$/;
    if (!phoneRegex.test(beneficiaryPhoneNumber)) {
        setFormMessage({ type: 'error', text: 'Format număr de telefon invalid. Ex: +373xxxxxxxx sau 0xxxxxxx.' });
        return;
    }


    const requestData: IMiaPaymentRequest = {
      fromAccountId: parseInt(fromAccountId, 10),
      beneficiaryPhoneNumber,
      amount: numericAmount,
      currency: 'LEI', // Plățile MIA sunt în LEI
      description: description || undefined,
    };

    try {
      await makeMiaPayment(requestData).unwrap();
      // Mesajul de succes este gestionat de useEffect [isSuccess]
    } catch (err) {
      // Mesajul de eroare este gestionat de useEffect [isError, paymentError]
      console.error('MIA payment failed in handleSubmit:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="transfer-form">
      {formMessage && <div className={`form-message ${formMessage.type}-message`}>{formMessage.text}</div>}
      
      <div className="form-group">
        <label htmlFor="miaFromAccount">Din contul: *</label>
        <select id="miaFromAccount" value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)} required disabled={isLoadingAccounts || isLoading}>
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
        <label htmlFor="miaBeneficiaryPhone">Număr Telefon Beneficiar: *</label>
        <input 
          type="tel" 
          id="miaBeneficiaryPhone" 
          value={beneficiaryPhoneNumber} 
          onChange={(e) => setBeneficiaryPhoneNumber(e.target.value)} 
          required 
          placeholder="+373xxxxxxxx / 0xxxxxxx" 
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="miaAmount">Suma (LEI): *</label>
        <input 
          type="number" 
          id="miaAmount" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          required 
          min="0.01" 
          step="0.01"
          placeholder="0.00"
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="miaDescription">Descriere (opțional):</label>
        <textarea 
          id="miaDescription" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          maxLength={140} 
          rows={2}
          placeholder="Detalii plată..."
          disabled={isLoading}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCloseModal} disabled={isLoading}>
          Anulează
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading || isSuccess}>
          {isLoading ? <><FaSpinner className="spinner-icon" /> Procesează...</> : 'Efectuează Plata MIA'}
        </button>
      </div>
    </form>
  );
};

export default MiaPaymentForm;