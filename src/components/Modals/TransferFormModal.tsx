// import React from 'react';
import { TransferType } from '../../shared/MainContent/MainContent'; // Ajustează calea
import { FaTimes } from 'react-icons/fa';
import './Modals.css';

// Importă formularele specifice
import TransferToOwnAccountForm from '../TransferForms/TransferToOwnAccountForm'; // Ajustează calea
import TransferIntrabankForm from '../TransferForms/TransferIntrabankForm';   // Ajustează calea și creează fișierul
import TransferDomesticBankForm from '../TransferForms/TransferDomesticBankForm'; // Ajustează calea și creează fișierul

interface TransferFormModalProps {
  transferType: TransferType;
  onClose: () => void;
}

const TransferFormModal = ({ transferType, onClose }: TransferFormModalProps) => {
  let FormComponent = null;
  let modalTitle = "Inițiază Transfer";

  switch (transferType) {
    case 'own_account':
      FormComponent = TransferToOwnAccountForm;
      modalTitle = "Transfer către Conturile Proprii";
      break;
    case 'intrabank':
      FormComponent = TransferIntrabankForm; // Folosește componenta reală
      modalTitle = "Transfer către Alt Cont Digital Banking";
      break;
    case 'domestic_bank':
      FormComponent = TransferDomesticBankForm; // Folosește componenta reală
      modalTitle = "Transfer către Altă Bancă din Moldova";
      break;
    default:
      console.error("Tip de transfer necunoscut în TransferFormModal:", transferType);
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