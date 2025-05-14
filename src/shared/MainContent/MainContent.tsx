import './MainContent.css';
import RecentTransactions from '../RecentTransactions/RecentTransactions';

const MainContent = () => {
  return (
    <main className="bank-main-content">
      <div className="dashboard-grid">
        {/* Balance Section */}
        <section className="balance-card">
          <h2>Current Balance</h2>
          <div className="balance-amount">$45,230.00</div>
          <div className="account-number">RO49BANK1234567890123456</div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h3>Quick Operations</h3>
          <div className="action-buttons">
            <button className="action-btn transfer">
              <div className="action-btn-inner">
                <span className="action-icon">→</span>
                <span>New Transfer</span>
              </div>
            </button>
            <button className="action-btn payment">
              <div className="action-btn-inner">
                <span className="action-icon">$</span>
                <span>Bill Payment</span>
              </div>
            </button>
            <button className="action-btn deposit">
              <div className="action-btn-inner">
                <span className="action-icon">+</span>
                <span>Deposit</span>
              </div>
            </button>
          </div>
        </section>

        {/* Transactions */}
        <RecentTransactions />
      </div>
    </main>
  );
};

export default MainContent;