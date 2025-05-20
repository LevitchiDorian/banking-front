// src/components/LandingPageComponents/HeroSection.tsx
import { useState, useEffect } from 'react'; // Adaugă useState
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../../app/Router';
import useScrollAnimation from '../../hooks/useScrollAnimation'; // Asigură-te că ai acest hook
import './LandingPageComponents.css'; // CSS-ul comun

const heroBackgrounds = [
  '/assets/1.jpg', // ÎNLOCUIEȘTE CU CĂILE REALE CĂTRE IMAGINILE TALE
  '/assets/2.jpg',
  '/assets/3.jpg',
  '/assets/4.jpg',
];
const HERO_SLIDE_INTERVAL = 7000; // 7 secunde pentru fiecare slide

const HeroSection = () => {
  useScrollAnimation();
  const navigate = useNavigate();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsFading(true); // Începe efectul de fade out
      setTimeout(() => {
        setCurrentBgIndex((prevIndex) => (prevIndex + 1) % heroBackgrounds.length);
        setIsFading(false); // Elimină clasa de fade, imaginea nouă e deja setată
      }, 500); // Durata fade-out (trebuie să se potrivească cu tranziția CSS)
    }, HERO_SLIDE_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  const currentBackgroundImage = `url('${heroBackgrounds[currentBgIndex]}')`;

  return (
    // Aplicăm imaginea de fundal dinamic și clasa de fading
    <section 
      className={`hero-section landing-section fade-in-section ${isFading ? 'fading-out' : 'fading-in'}`}
      style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.8)), ${currentBackgroundImage}` }}
      id="hero" // Adaugă ID pentru navigarea din header
    >
      {/* Nu mai avem nevoie de .hero-overlay separat dacă gradientul e în backgroundImage */}
      <div className="hero-content">
        <h1 className="hero-title">
          <span>Digital Banking,</span>
          <span>Reinventat pentru Tine.</span>
        </h1>
        <p className="hero-subtitle">
          Gestionează-ți finanțele simplu, rapid și în siguranță, oricând și de oriunde. 
          Experimentează viitorul serviciilor bancare.
        </p>
        <div className="hero-cta-buttons">
          <button 
            onClick={() => navigate(AppRoutes.REGISTER)} 
            className="cta-btn primary hero-cta-primary"
          >
            Deschide Cont Gratuit
          </button>
          <button 
            onClick={() => navigate(AppRoutes.LOGIN)} // Sau către o pagină "Despre Noi" / "Servicii"
            className="cta-btn secondary hero-cta-secondary"
          >
            Află Mai Multe
          </button>
        </div>
      </div>
      <div className="hero-scroll-indicator">
        <span></span>
      </div>
    </section>
  );
};

export default HeroSection;