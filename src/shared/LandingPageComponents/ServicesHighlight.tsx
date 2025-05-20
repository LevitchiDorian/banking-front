import React from 'react';
import { FaUniversity, FaPiggyBank, FaExchangeAlt } from 'react-icons/fa';
import './LandingPageComponents.css';

const services = [
  { icon: <FaUniversity />, title: "Conturi Curente & Economii", description: "Soluții flexibile pentru nevoile tale zilnice și obiectivele pe termen lung." },
  { icon: <FaPiggyBank />, title: "Credite Avantajoase", description: "Finanțare rapidă pentru planurile tale, cu dobânzi competitive." },
  { icon: <FaExchangeAlt />, title: "Transferuri Instant", description: "Trimite și primește bani instantaneu, național și internațional." },
];

const ServicesHighlight = () => {
  useScrollAnimation();
  return (
    <section className="services-highlight-section landing-section fade-in-section" id="services">
      <h2 className="section-title">Serviciile Noastre Esențiale</h2>
      <p className="section-subtitle">Descoperă cum îți putem simplifica viața financiară.</p>
      <div className="services-grid">
        {services.map((service, index) => (
          <div className="service-card" key={index}>
            <div className="service-icon">{service.icon}</div>
            <h3 className="service-title">{service.title}</h3>
            <p className="service-description">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
// Hook-ul useScrollAnimation (poate fi mutat într-un fișier utilitar separat)
const useEffect = React.useEffect; // Pentru a evita importul React peste tot dacă nu e necesar de JSX
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


export default ServicesHighlight;