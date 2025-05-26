// src/components/Modals/TransferFormModal.tsx
// VERSIUNEA CORECTATĂ PENTRU A RANDA FORMULARELE REALE
import React from 'react';
import { TransferType } from '../../shared/MainContent/MainContent'; // Ajustează calea dacă e necesar
import { FaTimes } from 'react-icons/fa';
import './Modals.css'; // Folosește CSS-ul comun Modals.css

// Importă formularele existente
import TransferToOwnAccountForm from '../TransferForms/TransferToOwnAccountForm';
import TransferIntrabankForm from '../TransferForms/TransferIntrabankForm';
import TransferDomesticBankForm from '../TransferForms/TransferDomesticBankForm';

// Importă noile formulare create (asigură-te că aceste fișiere există și exportă corect componentele)
import MiaPaymentForm from '../TransferForms/MiaPaymentForm';
import SepaPaymentForm from '../TransferForms/SepaPaymentForm';
import SwiftPaymentForm from '../TransferForms/SwiftPaymentForm';

interface TransferFormModalProps {
  transferType: TransferType; // Acesta vine din MainContent
  onClose: () => void;
}

const TransferFormModal: React.FC<TransferFormModalProps> = ({ transferType, onClose }) => {
  let FormComponent: React.FC<{ onCloseModal: () => void }> | null = null;
  let modalTitle = "Inițiază Operațiune";

  switch (transferType) {
    case 'own_account':
      FormComponent = TransferToOwnAccountForm;
      modalTitle = "Transfer către Conturile Proprii";
      break;
    case 'intrabank':
      FormComponent = TransferIntrabankForm;
      modalTitle = "Transfer către Alt Cont Digital Banking";
      break;
    case 'domestic_bank':
      FormComponent = TransferDomesticBankForm;
      modalTitle = "Transfer către Altă Bancă din Moldova";
      break;
    case 'mia':
      FormComponent = MiaPaymentForm; // Folosește componenta reală
      modalTitle = "Plată Instantanee Națională (MIA)";
      break;
    case 'sepa':
      FormComponent = SepaPaymentForm; // Folosește componenta reală
      modalTitle = "Plată SEPA (EUR)";
      break;
    case 'swift':
      FormComponent = SwiftPaymentForm; // Folosește componenta reală
      modalTitle = "Plată Internațională (SWIFT)";
      break;
    default:
      console.error("Tip de transfer/plată necunoscut în TransferFormModal:", transferType);
      onClose(); // Închide modalul dacă tipul nu e recunoscut
      return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal transfer-form-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Închide formularul">
          <FaTimes />
        </button>
        <h2>{modalTitle}</h2>
        {/* Pasează onCloseModal către formular pentru a-i permite să închidă modalul la submit/cancel */}
        {FormComponent && <FormComponent onCloseModal={onClose} />}
      </div>
    </div>
  );
};

export default TransferFormModal;