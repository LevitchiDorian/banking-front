import Register from '../../shared/Auth/Register';
import Footer from '../../shared/Footer/Footer';
import LandingHeader from '../../shared/LandingPageComponents/LandingHeader';


const RegisterPage = () => {
  return (
    <div className="bank-app-container">
      <LandingHeader />
      <Register />
      <Footer />
    </div>
  );
};

export default RegisterPage; 