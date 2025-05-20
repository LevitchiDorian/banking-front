import React from 'react';
import { FaShieldAlt, FaHeadset, FaRocket } from 'react-icons/fa';
import './LandingPageComponents.css';

const benefits = [
  { icon: <FaShieldAlt />, title: "Securitate Maximă", description: "Tehnologii avansate pentru a-ți proteja datele și fondurile." },
  { icon: <FaHeadset />, title: "Suport Dedicat 24/7", description: "Echipa noastră este aici pentru tine la orice oră." },
  { icon: <FaRocket />, title: "Inovație Continuă", description: "Îmbunătățim constant serviciile pentru o experiență de top." },
];

const BenefitsSection = () => {
  useScrollAnimation();
  return (
    <section className="benefits-section landing-section fade-in-section" id="benefits">
      <h2 className="section-title">De Ce Digital Banking?</h2>
      <p className="section-subtitle">Ne dedicăm să îți oferim cea mai bună experiență bancară digitală.</p>
      <div className="benefits-grid">
        {benefits.map((benefit, index) => (
          <div className="benefit-item" key={index}>
            <div className="benefit-icon">{benefit.icon}</div>
            <h3 className="benefit-title">{benefit.title}</h3>
            <p className="benefit-description">{benefit.description}</p>
          </div>
        ))}
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

export default BenefitsSection;