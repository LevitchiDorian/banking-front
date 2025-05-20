import { useEffect } from 'react';

const useScrollAnimation = (threshold: number = 0.1): void => {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('.fade-in-section');

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Oprește observarea după ce a devenit vizibil
          }
        });
      },
      { threshold: threshold }
    );

    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, [threshold]);
};

export default useScrollAnimation;