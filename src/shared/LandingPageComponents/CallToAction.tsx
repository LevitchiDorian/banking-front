import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../../app/Router';
import './LandingPageComponents.css';

const CallToAction = () => {
  useScrollAnimation();
  const navigate = useNavigate();
  return (
    <section className="cta-section landing-section fade-in-section" id="contact">
      <div className="cta-content">
        <h2 className="cta-title">Gata să Începi?</h2>
        <p className="cta-text">
          Alătură-te milioanelor de clienți mulțumiți și descoperă viitorul banking-ului.
          Este simplu, rapid și sigur.
        </p>
        <button
          onClick={() => {
            navigate(AppRoutes.REGISTER);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="cta-btn primary large"
        >
          Creează Cont Acum
        </button>
      </div>
    </section>
  );
};
// Hook-ul useScrollAnimation (poate fi mutat într-un fișier utilitar separat)
const useEffect = React.useEffect;
const useScrollAnimation = () => { /* ... (codul hook-ului ca în HeroSection) ... */
    useEffect(() => {
        const sections = document.querySelectorAll('.fade-in-section');
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
            }
          });
        }, { threshold: 0.1 });
        sections.forEach(section => observer.observe(section));
        return () => sections.forEach(section => observer.unobserve(section));
      }, []);
 };

export default CallToAction;