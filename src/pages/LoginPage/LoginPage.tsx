import Login from '../../shared/Auth/Login';
import Footer from '../../shared/Footer/Footer';
import Header from '../../shared/Header/Header';


const LoginPage = () => {
  return (
    <div className="bank-app-container">
      <Header />
      <Login />
      <Footer />
    </div>
  );
};

export default LoginPage; 