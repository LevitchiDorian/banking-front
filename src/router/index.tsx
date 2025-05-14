import { AppRoutes } from '../app/Router';
import  MainPage  from '../pages/MainPage/MainPage';
import { Route, Routes } from 'react-router-dom';
import  RecentTransactions  from '../shared/RecentTransactions/RecentTransactions';
import LoginPage from '../pages/LoginPage/LoginPage';
import RegisterPage from '../pages/RegisterPage/RegisterPage';
import TransfersPage from '../pages/TransfersPage/TransfersPage';




export const Routing = () => (
    <Routes>
      <Route path={AppRoutes.MAIN} element={<MainPage />} />
      <Route path={AppRoutes.RECENT_TRANSACTIONS} element={< RecentTransactions/>} />
      <Route path={AppRoutes.LOGIN} element={<LoginPage />} />
      <Route path={AppRoutes.REGISTER} element={<RegisterPage />} />
      <Route path={AppRoutes.TRANSFERS} element={<TransfersPage />} />

    </Routes>
  );