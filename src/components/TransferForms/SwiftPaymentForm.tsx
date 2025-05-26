// src/components/TransferForms/SwiftPaymentForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { useGetUserDbAccountsQuery, useMakeSwiftPaymentMutation } from '../../store/bankingApi'; // Ajustează calea
import { IDbAccountResponseDTO } from '../../entities/IDbAccountResponseDTO';
import { ISwiftPaymentRequest } from '../../entities/ISwiftPaymentRequest';
import { FaSpinner } from 'react-icons/fa';
import './TransferForms.css';

interface SwiftPaymentFormProps {
  onCloseModal: () => void;
}

const SwiftPaymentForm: React.FC<SwiftPaymentFormProps> = ({ onCloseModal }) => {
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [beneficiaryName, setBeneficiaryName] = useState<string>('');
  const [beneficiaryAddress, setBeneficiaryAddress] = useState<string>('');
  const [beneficiaryIban, setBeneficiaryIban] = useState<string>('');
  const [beneficiaryBankBic, setBeneficiaryBankBic] = useState<string>('');
  const [beneficiaryBankName, setBeneficiaryBankName] = useState<string>('');
  const [beneficiaryBankAddress, setBeneficiaryBankAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('EUR'); // Default EUR, utilizatorul poate schimba
  const [paymentDetails, setPaymentDetails] = useState<string>('');
  const [charges, setCharges] = useState<'OUR' | 'BEN' | 'SHA'>('SHA'); // Default SHA
  const [correspondentBankBic, setCorrespondentBankBic] = useState<string>('');
  const [correspondentBankName, setCorrespondentBankName] = useState<string>('');
  const [correspondentBankAccount, setCorrespondentBankAccount] = useState<string>('');


  const [makeSwiftPayment, { isLoading, isSuccess, reset: resetSwiftMutation, isError, error: paymentError }] = useMakeSwiftPaymentMutation();
  const { data: userAccounts, isLoading: isLoadingAccounts } = useGetUserDbAccountsQuery();
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isSuccess) {
      setFormMessage({ type: 'success', text: `Plata SWIFT către ${beneficiaryName} a fost inițiată cu succes!` });
      const timer = setTimeout(() => {
        // Reset all fields
        setFromAccountId(''); setBeneficiaryName(''); setBeneficiaryAddress('');
        setBeneficiaryIban(''); setBeneficiaryBankBic(''); setBeneficiaryBankName('');
        setBeneficiaryBankAddress(''); setAmount(''); setCurrency('EUR');
        setPaymentDetails(''); setCharges('SHA'); setCorrespondentBankBic('');
        setCorrespondentBankName(''); setCorrespondentBankAccount('');
        resetSwiftMutation();
      }, 5000); // Timp mai lung pentru a citi mesajul
      return () => clearTimeout(timer);
    }
  }, [isSuccess, beneficiaryName, resetSwiftMutation]);

  useEffect(() => {
    if (isError && paymentError) {
        const message = (paymentError as any)?.data?.message || (paymentError as any)?.error || 'A apărut o eroare la procesarea plății SWIFT.';
        setFormMessage({ type: 'error', text: message });
    }
  }, [isError, paymentError]);


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage(null);
    resetSwiftMutation();

    if (!fromAccountId || !beneficiaryName || !beneficiaryAddress || !beneficiaryIban || 
        !beneficiaryBankBic || !beneficiaryBankName || !amount || !currency || !paymentDetails || !charges) {
        setFormMessage({ type: 'error', text: 'Toate câmpurile marcate cu * sunt obligatorii.' });
        return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        setFormMessage({ type: 'error', text: 'Suma trebuie să fie un număr pozitiv.' });
        return;
    }
    // Aici ar trebui adăugate validări mai stricte pentru IBAN, BIC, etc.

    const requestData: ISwiftPaymentRequest = {
      fromAccountId: parseInt(fromAccountId, 10),
      beneficiaryName,
      beneficiaryAddress,
      beneficiaryIban: beneficiaryIban.toUpperCase().replace(/\s/g, ''),
      beneficiaryBankBic: beneficiaryBankBic.toUpperCase().replace(/\s/g, ''),
      beneficiaryBankName,
      beneficiaryBankAddress: beneficiaryBankAddress || undefined,
      amount: numericAmount,
      currency: currency.toUpperCase(),
      paymentDetails,
      charges,
      correspondentBankBic: correspondentBankBic || undefined,
      correspondentBankName: correspondentBankName || undefined,
      correspondentBankAccount: correspondentBankAccount || undefined,
    };

    try {
      await makeSwiftPayment(requestData).unwrap();
    } catch (err) {
      console.error('SWIFT payment failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="transfer-form swift-form"> {/* Clasă specifică pentru layout dacă e nevoie */}
      {formMessage && <div className={`form-message ${formMessage.type}-message`}>{formMessage.text}</div>}
      
      <div className="form-section">
        <h4>Cont Sursă</h4>
        <div className="form-group">
          <label htmlFor="swiftFromAccount">Din contul: *</label>
          <select id="swiftFromAccount" value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)} required disabled={isLoadingAccounts || isLoading}>
            <option value="">Selectează contul...</option>
            {userAccounts?.map((acc: IDbAccountResponseDTO) => (
              <option key={acc.id} value={acc.id.toString()}>
                {acc.accountTypeName} ({acc.accountNumber}) - {acc.balance.toLocaleString('ro-MD')} {acc.currency}
              </option>
            ))}
          </select>
          {isLoadingAccounts && <small>Se încarcă conturile...</small>}
        </div>
      </div>

      <div className="form-section">
        <h4>Detalii Beneficiar</h4>
        <div className="form-group">
          <label htmlFor="swiftBeneficiaryName">Nume Beneficiar Complet: *</label>
          <input type="text" id="swiftBeneficiaryName" value={beneficiaryName} onChange={(e) => setBeneficiaryName(e.target.value)} required disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="swiftBeneficiaryAddress">Adresă Beneficiar (incl. țara): *</label>
          <input type="text" id="swiftBeneficiaryAddress" value={beneficiaryAddress} onChange={(e) => setBeneficiaryAddress(e.target.value)} required disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="swiftBeneficiaryIban">IBAN Beneficiar: *</label>
          <input type="text" id="swiftBeneficiaryIban" value={beneficiaryIban} onChange={(e) => setBeneficiaryIban(e.target.value)} required disabled={isLoading} />
        </div>
      </div>

      <div className="form-section">
        <h4>Detalii Bancă Beneficiar</h4>
        <div className="form-group">
          <label htmlFor="swiftBeneficiaryBankBic">BIC/SWIFT Bancă Beneficiar: *</label>
          <input type="text" id="swiftBeneficiaryBankBic" value={beneficiaryBankBic} onChange={(e) => setBeneficiaryBankBic(e.target.value)} required disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="swiftBeneficiaryBankName">Nume Bancă Beneficiar: *</label>
          <input type="text" id="swiftBeneficiaryBankName" value={beneficiaryBankName} onChange={(e) => setBeneficiaryBankName(e.target.value)} required disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="swiftBeneficiaryBankAddress">Adresă Bancă Beneficiar (opțional):</label>
          <input type="text" id="swiftBeneficiaryBankAddress" value={beneficiaryBankAddress} onChange={(e) => setBeneficiaryBankAddress(e.target.value)} disabled={isLoading} />
        </div>
      </div>
      
      <div className="form-section">
        <h4>Detalii Plată</h4>
        <div className="form-group">
          <label htmlFor="swiftAmount">Suma: *</label>
          <input type="number" id="swiftAmount" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01" placeholder="0.00" disabled={isLoading}/>
        </div>
         <div className="form-group">
          <label htmlFor="swiftCurrency">Moneda: *</label>
          <input type="text" id="swiftCurrency" value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} required maxLength={3} placeholder="EUR" disabled={isLoading}/>
          <small>Ex: EUR, USD, GBP. Asigură-te că ai fonduri în moneda selectată sau echivalent.</small>
        </div>
        <div className="form-group">
          <label htmlFor="swiftPaymentDetails">Detalii/Scopul Plății: *</label>
          <textarea id="swiftPaymentDetails" value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)} required rows={3} disabled={isLoading}/>
        </div>
        <div className="form-group">
          <label htmlFor="swiftCharges">Comisioane (Charges): *</label>
          <select id="swiftCharges" value={charges} onChange={(e) => setCharges(e.target.value as 'OUR' | 'BEN' | 'SHA')} required disabled={isLoading}>
            <option value="SHA">SHA (Shared - plătitorul plătește comisioanele băncii sale, beneficiarul pe ale sale)</option>
            <option value="OUR">OUR (Plătitorul suportă toate comisioanele)</option>
            <option value="BEN">BEN (Beneficiarul suportă toate comisioanele, se deduc din sumă)</option>
          </select>
        </div>
      </div>

      <div className="form-section">
        <h4>Detalii Bancă Corespondentă (Opțional)</h4>
        <div className="form-group">
          <label htmlFor="swiftCorrespondentBankBic">BIC Bancă Corespondentă:</label>
          <input type="text" id="swiftCorrespondentBankBic" value={correspondentBankBic} onChange={(e) => setCorrespondentBankBic(e.target.value)} disabled={isLoading}/>
        </div>
        <div className="form-group">
          <label htmlFor="swiftCorrespondentBankName">Nume Bancă Corespondentă:</label>
          <input type="text" id="swiftCorrespondentBankName" value={correspondentBankName} onChange={(e) => setCorrespondentBankName(e.target.value)} disabled={isLoading}/>
        </div>
         <div className="form-group">
          <label htmlFor="swiftCorrespondentBankAccount">Cont la Banca Corespondentă:</label>
          <input type="text" id="swiftCorrespondentBankAccount" value={correspondentBankAccount} onChange={(e) => setCorrespondentBankAccount(e.target.value)} disabled={isLoading}/>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCloseModal} disabled={isLoading}>Anulează</button>
        <button type="submit" className="btn btn-primary" disabled={isLoading || isSuccess}>
          {isLoading ? <><FaSpinner className="spinner-icon" /> Inițiază Plata SWIFT...</> : 'Inițiază Plata SWIFT'}
        </button>
      </div>
    </form>
  );
};

export default SwiftPaymentForm;