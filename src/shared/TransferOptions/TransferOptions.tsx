// import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../../app/Router'; // Ajustează calea
import {
  FaExchangeAlt,
  FaUniversity,
  FaLandmark,
  FaChevronRight // Iconiță pentru "mergi la"
} from 'react-icons/fa';
import './TransferOptions.css'; // Vom crea acest fișier CSS

const transferOptionsConfig = [
  {
    title: 'Transfer către Conturile Proprii',
    description: 'Mută fonduri între conturile tale curente sau de economii.',
    icon: <FaExchangeAlt />,
    route: AppRoutes.TRANSFER_OWN_ACCOUNT,
    colorClass: 'transfer-option-own',
  },
  {
    title: 'Transfer către Alt Cont Digital Banking',
    description: 'Trimite bani rapid altor clienți ai băncii noastre.',
    icon: <FaUniversity />,
    route: AppRoutes.TRANSFER_INTRABANK,
    colorClass: 'transfer-option-intrabank',
  },
  {
    title: 'Transfer către Altă Bancă din Moldova',
    description: 'Efectuează plăți către conturi deschise la alte bănci naționale.',
    icon: <FaLandmark />,
    route: AppRoutes.TRANSFER_DOMESTIC,
    colorClass: 'transfer-option-domestic',
  },
  // Poți adăuga aici "Transfer Internațional" etc. în viitor
];

const TransferOptions = () => {
  const navigate = useNavigate();

  const handleOptionClick = (route: AppRoutes) => {
    navigate(route);
  };

  return (
    <div className="transfer-options-container">
      {transferOptionsConfig.map((option) => (
        <div
          key={option.route}
          className={`transfer-option-card ${option.colorClass}`}
          onClick={() => handleOptionClick(option.route)}
          role="button" // Pentru accesibilitate
          tabIndex={0} // Pentru accesibilitate (focus)
          onKeyPress={(e) => e.key === 'Enter' && handleOptionClick(option.route)} // Pentru accesibilitate (Enter)
        >
          <div className="transfer-option-icon-wrapper">
            {option.icon}
          </div>
          <div className="transfer-option-content">
            <h3>{option.title}</h3>
            <p>{option.description}</p>
          </div>
          <div className="transfer-option-action">
            <FaChevronRight />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransferOptions;