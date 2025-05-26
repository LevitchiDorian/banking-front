// src/components/Modals/TransferTypeSelectionModal.tsx
// VERSIUNEA NOUĂ CU AJUSTĂRI
import React, { JSX } from 'react'; // Adaugă importul React dacă nu e implicit
import { TransferType } from '../../shared/MainContent/MainContent';
import {
  FaExchangeAlt,     // Pentru conturi proprii
  FaUniversity,      // Pentru intrabancar
  FaLandmark,        // Pentru interbancar național
  FaMobileAlt,       // Pentru MIA (telefon)
  FaGlobeEurope,     // Pentru SEPA
  FaPaperPlane,      // Pentru SWIFT (general internațional)
  FaTimes,
} from 'react-icons/fa';
import './Modals.css';

interface TransferTypeSelectionModalProps {
  isOpen: boolean; // Adaugă isOpen pentru a controla vizibilitatea din MainContent
  onClose: () => void;
  onSelectTransferType: (type: TransferType) => void;
}

// Am actualizat `id` la `key` pentru consistență cu codul anterior și am adăugat noile tipuri
const transferOptionsConfig: { key: TransferType; label: string; icon: JSX.Element; description: string }[] = [
  {
    key: 'own_account',
    label: 'Transfer către Conturile Proprii',
    icon: <FaExchangeAlt />,
    description: "Mută bani între conturile tale."
  },
  {
    key: 'intrabank',
    label: 'Transfer către Alt Cont Digital Banking',
    icon: <FaUniversity />,
    description: "Trimite bani altor clienți ai băncii."
  },
  {
    key: 'domestic_bank',
    label: 'Transfer către Altă Bancă din Moldova',
    icon: <FaLandmark />,
    description: "Plăți către alte bănci naționale."
  },
  {
    key: 'mia',
    label: 'Plată Instantanee Națională (MIA)',
    icon: <FaMobileAlt />,
    description: "Transfer rapid în LEI prin număr de telefon."
  },
  {
    key: 'sepa',
    label: 'Plată SEPA (EUR)',
    icon: <FaGlobeEurope />,
    description: "Transfer în EUR către bănci din zona SEPA."
  },
  {
    key: 'swift',
    label: 'Plată Internațională (SWIFT)',
    icon: <FaPaperPlane />,
    description: "Transfer în diverse valute către bănci din lume."
  },
];

const TransferTypeSelectionModal: React.FC<TransferTypeSelectionModalProps> = ({ isOpen, onClose, onSelectTransferType }) => {
  if (!isOpen) return null; // Controlăm vizibilitatea prin props

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content transfer-selection-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Închide selecția">
          <FaTimes />
        </button>
        <h2>Alege Tipul de Transfer sau Plată</h2>
        <ul className="modal-options-list">
          {transferOptionsConfig.map((option) => (
            <li
              key={option.key}
              onClick={() => onSelectTransferType(option.key)}
              className="modal-option-item selectable"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && onSelectTransferType(option.key)}
            >
              <span className="modal-option-icon">{option.icon}</span>
              <div className="modal-option-text">
                <span className="modal-option-label">{option.label}</span>
                <span className="modal-option-description">{option.description}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TransferTypeSelectionModal;