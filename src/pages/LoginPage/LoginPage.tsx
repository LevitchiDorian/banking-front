import Login from '../../shared/Auth/Login';
import Footer from '../../shared/Footer/Footer';
import LandingHeader from '../../shared/LandingPageComponents/LandingHeader';


const LoginPage = () => {
  return (
    <div className="bank-app-container">
      <LandingHeader/>
      <Login />
      <Footer />
    </div>
  );
};

export default LoginPage; 