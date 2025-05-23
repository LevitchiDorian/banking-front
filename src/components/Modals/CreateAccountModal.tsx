// src/components/Modals/CreateAccountModal.tsx
import React, { useState, useEffect } from 'react';
import { useCreateDbAccountMutation } from '../../store/bankingApi';
import { ICreateAccountRequestDTO } from '../../entities/ICreateAccountRequestDTO';
import { AccountTypeOption } from '../../constants/accountTypes'; // Importăm tipul
import './CreateAccountModal.css';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: (newAccountName: string) => void;
  availableAccountTypes: AccountTypeOption[]; // Prop nou
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onCreateSuccess,
  availableAccountTypes, // Destructurăm noul prop
}) => {
  // Setează tipul de cont implicit la primul tip disponibil, dacă există
  const [selectedAccountType, setSelectedAccountType] = useState<string>(
    availableAccountTypes.length > 0 ? availableAccountTypes[0].value : ''
  );
  const [initialDeposit, setInitialDeposit] = useState<string>('0');
  const [currency, setCurrency] = useState<string>('LEI');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [createDbAccount, { isLoading, isError, error: apiErrorObject }] = useCreateDbAccountMutation(); // redenumește 'error' pentru a evita conflict

  // Actualizează selectedAccountType dacă availableAccountTypes se schimbă și modalul este deschis
  useEffect(() => {
    if (isOpen && availableAccountTypes.length > 0) {
      // Dacă tipul selectat curent nu mai e în lista disponibilă, resetează-l
      if (!availableAccountTypes.find(opt => opt.value === selectedAccountType)) {
        setSelectedAccountType(availableAccountTypes[0].value);
      }
    } else if (isOpen && availableAccountTypes.length === 0) {
        // Teoretic, nu ar trebui să ajungem aici dacă butonul e dezactivat corect în Conturi.tsx
        // Dar ca măsură de siguranță:
        setErrorMessage("Nu mai sunt tipuri de conturi disponibile pentru creare.");
    }
  }, [isOpen, availableAccountTypes, selectedAccountType]);


  useEffect(() => {
    if (isError && apiErrorObject) {
      if ('data' in apiErrorObject && apiErrorObject.data && typeof apiErrorObject.data === 'object' && 'message' in apiErrorObject.data) {
        setErrorMessage((apiErrorObject.data as { message: string }).message);
      } else if ('error' in apiErrorObject && typeof apiErrorObject.error === 'string' && apiErrorObject.error.includes("Failed to fetch")) {
        setErrorMessage('Eroare de rețea. Verificați conexiunea la server.')
      }
      else {
        setErrorMessage('A apărut o eroare la crearea contului.');
      }
    } else {
      setErrorMessage(null);
    }
  }, [isError, apiErrorObject]);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal is closed
      setSelectedAccountType(availableAccountTypes.length > 0 ? availableAccountTypes[0].value : '');
      setInitialDeposit('0');
      setCurrency('LEI');
      setErrorMessage(null);
      setSuccessMessage(null); // Resetează și mesajul de succes
    }
  }, [isOpen, availableAccountTypes]); // Adaugă availableAccountTypes ca dependență

  useEffect(() => {
    // Clear success message after a delay if modal is still open and there was a success
    if (successMessage && isOpen) {
      const timer = setTimeout(() => {
          setSuccessMessage(null);
          onClose(); // Închide modalul după ce mesajul de succes a fost afișat și a dispărut
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, isOpen, onClose]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (availableAccountTypes.length === 0 || !selectedAccountType) {
      setErrorMessage('Nu sunt tipuri de conturi disponibile sau nu ați selectat un tip de cont.');
      return;
    }

    const depositAmount = parseFloat(initialDeposit);
    if (isNaN(depositAmount) || depositAmount < 0) {
      setErrorMessage('Suma depozitului inițial trebuie să fie un număr valid, zero sau pozitiv.');
      return;
    }

    const requestData: ICreateAccountRequestDTO = {
      accountTypeName: selectedAccountType,
      initialDeposit: depositAmount,
      currency: currency.trim().toUpperCase() || 'LEI', // Asigură-te că moneda e trimisă corect
    };

    try {
      const newAccount = await createDbAccount(requestData).unwrap();
      const accountLabel = availableAccountTypes.find(opt => opt.value === newAccount.accountTypeName)?.label || newAccount.accountTypeName;
      setSuccessMessage(`Contul "${accountLabel}" (${newAccount.accountNumber}) a fost creat cu succes!`);
      onCreateSuccess(newAccount.accountTypeName);
      // Nu închide modalul imediat, lasă useEffect-ul pentru successMessage să o facă
    } catch (err) {
      // Gestionat de useEffect pentru isError și apiErrorObject
      console.error('Failed to create account:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content create-account-modal">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ×
        </button>
        <h2>Deschide Cont Nou</h2>

        {successMessage && <div className="form-message success-message">{successMessage}</div>}
        {errorMessage && <div className="form-message error-message">{errorMessage}</div>}

        {/* Ascunde formularul dacă nu sunt tipuri disponibile și este un mesaj de eroare general */}
        {!(availableAccountTypes.length === 0 && errorMessage && !successMessage) && (
            <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="accountType">Tip Cont:</label>
                <select
                id="accountType"
                value={selectedAccountType}
                onChange={(e) => setSelectedAccountType(e.target.value)}
                required
                disabled={availableAccountTypes.length === 0 || isLoading}
                >
                {/* Dacă nu sunt tipuri, poți afișa o opțiune placeholder sau nimic */}
                {availableAccountTypes.length === 0 && <option value="">-- Nu sunt tipuri disponibile --</option>}
                {availableAccountTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                    {type.label}
                    </option>
                ))}
                </select>
            </div>


            <div className="form-group">
                <label htmlFor="currency">Monedă:</label>
                <input
                type="text"
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                maxLength={3}
                placeholder="LEI"
                disabled={isLoading}
                />
                <small>Implicit: LEI. Opțional: USD, EUR.</small>
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
                Anulează
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading || availableAccountTypes.length === 0 || !selectedAccountType}
                >
                {isLoading ? 'Se creează...' : 'Creează Cont'}
                </button>
            </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default CreateAccountModal;