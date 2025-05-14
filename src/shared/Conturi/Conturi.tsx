import { useState, useRef, useEffect } from 'react';
import './Conturi.css'; 

type Account = {
  id: number;
  number: string;
  balance: string;
};

const Conturi = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const accounts: Account[] = [
    { id: 1, number: 'MD49AAAA1B31007593840000', balance: '2,450.00 LEI' },
    { id: 2, number: 'MD49AAAA1B31007593840001', balance: '1,230.50 EUR' },
    { id: 3, number: 'MD49AAAA1B31007593840002', balance: '850.00 USD' }
  ];

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="nav-btn-container" ref={dropdownRef}>
      <button 
        className="nav-btn" 
        onClick={() => setShowDropdown(!showDropdown)}
      >
        Conturi
      </button>
      
      {showDropdown && (
        <div className="accounts-dropdown">
          <div className="dropdown-header">Conturile mele</div>
          {accounts.map((account) => (
            <div key={account.id} className="account-item">
              <div className="account-number">{account.number}</div>
              <div className="account-balance">{account.balance}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Conturi;