// import React from 'react'; // Adaugă importul React
import Header from '../../shared/Header/Header';
import MainContent from '../../shared/MainContent/MainContent';
import Footer from '../../shared/Footer/Footer';

const MainPage = () => {
  return (
    <div className="bank-app-container">
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
};

export default MainPage; // Export default corect