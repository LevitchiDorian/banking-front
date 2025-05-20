import React from 'react';
import Footer from '../../shared/Footer/Footer'; // Presupunând că refolosești Footer-ul
import LandingHeader from '../../shared/LandingPageComponents/LandingHeader'; // Header-ul pentru Landing Page
import HeroSection from '../../shared/LandingPageComponents/HeroSection'; // Secțiunea de Hero
import ServicesHighlight from '../../shared/LandingPageComponents/ServicesHighlight'; // Secțiunea de Servicii
import BenefitsSection from '../../shared/LandingPageComponents/BenefitsSection'; // Secțiunea de Beneficii
import CallToAction from '../../shared/LandingPageComponents/CallToAction'; // Secțiunea de Call to Action
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page-wrapper"> {/* Wrapper pentru a nu afecta global .landing-page */}
      <LandingHeader />
      <div className="landing-page-content"> {/* Container pentru secțiuni */}
        <HeroSection />
        <ServicesHighlight />
        <BenefitsSection />
        <CallToAction />
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;