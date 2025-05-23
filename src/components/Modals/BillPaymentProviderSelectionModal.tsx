// src/components/Modals/BillPaymentProviderSelectionModal.tsx
import React from 'react';
import { BILLERS, Biller } from '../../constants/billers';
import './BillPaymentModals.css'; // Vom crea acest CSS

interface BillPaymentProviderSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProvider: (biller: Biller) => void;
}

const BillPaymentProviderSelectionModal: React.FC<BillPaymentProviderSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectProvider,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content provider-selection-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ×
        </button>
        <h2>Selectează Furnizorul</h2>
        <div className="provider-list">
          {BILLERS.map((biller) => (
            <button
              key={biller.key}
              className="provider-item-btn"
              onClick={() => onSelectProvider(biller)}
            >
              {biller.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillPaymentProviderSelectionModal;