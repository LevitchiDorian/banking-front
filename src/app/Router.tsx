export enum AppRoutes {
    MAIN = '/',
    RECENT_TRANSACTIONS = '/recent-transactions', // Probabil nu mai e necesară ca rută separată dacă e integrată în MainContent
    REGISTER = '/register',
    LOGIN = '/login',
    // ACCOUNTS = '/accounts', // Dacă ai o pagină dedicată pentru listarea conturilor (nu doar dropdown)
    TRANSFERS = '/transfers',
    TRANSFER_OWN_ACCOUNT = '/transfers/own-account', // Rută nouă
    TRANSFER_INTRABANK = '/transfers/intrabank',     // Rută nouă
    TRANSFER_DOMESTIC = '/transfers/domestic-bank', // Rută nouă
  }