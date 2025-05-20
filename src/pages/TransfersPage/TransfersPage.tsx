
import Header from '../../shared/Header/Header';
import Footer from '../../shared/Footer/Footer';
import AllUserTransactions from '../../shared/AllUserTransactions/AllUserTransactions';
import './TransfersPage.css';
import { motion, AnimatePresence } from 'framer-motion'; // Importă motion și AnimatePresence

// Variante de animație pentru containerul principal al paginii
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20, // Pornește puțin mai de jos
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5, // Durata animației principale
      ease: "easeInOut",
      when: "beforeChildren", // Asigură că părintele animă înainte de copii
      staggerChildren: 0.2,  // Delay între animațiile copiilor
    }
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

// Variante pentru elementele individuale (titlu, subtitlu, lista de tranzacții)
const itemVariants = {
  initial: { opacity: 0, y: 15 },
  in: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  out: { // Opțional, dacă vrei animație la ieșire
    opacity: 0,
    y: -15,
    transition: { duration: 0.2, ease: "easeIn" }
  }
};


const TransfersPage = () => {
  return (
    <div className="bank-app-container">
      <Header />
      {/* AnimatePresence este util dacă ai rute care se schimbă și vrei animații la ieșire */}
      <AnimatePresence mode="wait"> 
        <motion.main
          key="transfers-page" // Cheie unică pentru AnimatePresence
          className="page-content transfers-history-page"
          variants={pageVariants}
          initial="initial"
          animate="in"
          exit="out" // Doar dacă folosești AnimatePresence pentru tranziții între pagini
        >
          <motion.div className="page-title-container" variants={itemVariants}>
            <h1>Istoricul Tuturor Tranzacțiilor</h1>
            <p>Vizualizați toate mișcările financiare din conturile dumneavoastră.</p>
          </motion.div>
          
          {/* Wrapper pentru a aplica animația pe lista de tranzacții ca un întreg */}
          <motion.div 
            className="transfers-history-page-content-wrapper" 
            variants={itemVariants} // Poți folosi aceleași variante sau altele specifice
          >
            <AllUserTransactions /> 
          </motion.div>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default TransfersPage;