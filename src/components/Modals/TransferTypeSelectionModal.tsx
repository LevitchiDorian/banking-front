// import React from 'react';
import { TransferType } from '../../shared/MainContent/MainContent'; // Ajustează calea
import {
  FaExchangeAlt,
  FaUniversity,
  FaLandmark,
  FaTimes,
} from 'react-icons/fa';
import './Modals.css'; // Vom crea acest fișier CSS

interface TransferTypeSelectionModalProps {
  onClose: () => void;
  onSelectTransferType: (type: TransferType) => void;
}

// Am scos 'route' de aici, deoarece nu mai navigăm, ci setăm starea
const transferOptionsConfig = [
  {
    id: 'own_account' as TransferType,
    label: 'Transfer către Conturile Proprii',
    icon: <FaExchangeAlt />,
    description: "Mută bani între conturile tale."
  },
  {
    id: 'intrabank' as TransferType,
    label: 'Transfer către Alt Cont Digital Banking',
    icon: <FaUniversity />,
    description: "Trimite bani altor clienți ai băncii."
  },
  {
    id: 'domestic_bank' as TransferType,
    label: 'Transfer către Altă Bancă din Moldova',
    icon: <FaLandmark />,
    description: "Plăți către alte bănci naționale."
  },
];

const TransferTypeSelectionModal = ({ onClose, onSelectTransferType }: TransferTypeSelectionModalProps) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content transfer-selection-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Închide selecția">
          <FaTimes />
        </button>
        <h2>Alege Tipul de Transfer</h2>
        <ul className="modal-options-list">
          {transferOptionsConfig.map((option) => (
            <li
              key={option.id}
              onClick={() => onSelectTransferType(option.id)}
              className="modal-option-item selectable" // Adăugăm 'selectable' pentru efecte de hover
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && onSelectTransferType(option.id)}
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