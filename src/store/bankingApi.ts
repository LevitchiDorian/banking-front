import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IUserDTO } from '../entities/IUserDTO';
import { ILoginResponse } from '../entities/ILoginResponse';
import { ICreateAccountRequestDTO } from '../entities/ICreateAccountRequestDTO';
import { IDbAccountResponseDTO } from '../entities/IDbAccountResponseDTO';
import { IDbTransactionResponseDTO } from '../entities/IDbTransactionResponseDTO';

// Funcție helper pentru a prelua token-ul.
const getToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  // Log pentru a vedea ce token este preluat din localStorage
  console.log('[bankingApi:getToken] Retrieved token from localStorage:', token ? token.substring(0, 20) + "..." : null);
  return token;
};

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8081', // URL-ul de bază al backend-ului dumneavoastră
  prepareHeaders: (headers, { getState }) => { // getState este disponibil, deși nu-l folosim direct aici
    const token = getToken(); // Apelăm funcția noastră helper

    // Log pentru a vedea dacă și cum se setează header-ul Authorization
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      console.log('[bankingApi:prepareHeaders] Authorization header SET with token:', token.substring(0, 20) + "...");
    } else {
      console.warn('[bankingApi:prepareHeaders] No token found, Authorization header NOT SET.');
    }
    // Este o bună practică să setăm Content-Type aici dacă majoritatea request-urilor POST/PUT vor fi JSON
    // Deși pentru GET nu este necesar, nu strică.
    // Pentru request-uri specifice care nu sunt JSON, se poate suprascrie în definiția endpoint-ului.
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const bankingApiSlice = createApi({
  reducerPath: 'bankingApi',
  baseQuery: baseQuery,
  tagTypes: ['UserAccount', 'UserTransaction', 'AuthStatus'], // Tag-uri pentru invalidarea cache-ului
  endpoints: (builder) => ({
    // --- Auth Endpoints ---
    registerUser: builder.mutation<string, IUserDTO>({
      query: (userCredentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: userCredentials,
      }),
      // Opcional: invalidează stări sau refă query-uri dacă este relevant după înregistrare
      // invalidatesTags: ['SomeTagIfNeeded'],
    }),
    loginUser: builder.mutation<ILoginResponse, IUserDTO>({
      query: (userCredentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: userCredentials,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) { // _arg pentru a indica că nu-l folosim explicit
        console.log('[bankingApi:loginUser:onQueryStarted] Attempting login...');
        try {
          const { data } = await queryFulfilled;
          // Stochează token-ul în localStorage
          localStorage.setItem('authToken', data.token);
          // Log pentru a confirma salvarea token-ului
          console.log('[bankingApi:loginUser:onQueryStarted] Login successful. Token SAVED to localStorage:', data.token ? data.token.substring(0, 20) + "..." : null);
          
          // Opcional: Dispecerizează o acțiune pentru a actualiza starea de autentificare în store-ul Redux
          // if (dispatch && userLoggedIn) { // Asigură-te că ai importat userLoggedIn
          //   dispatch(userLoggedIn({ token: data.token, expiresIn: data.expiresIn }));
          // }

          // Opcional: Forțează invalidarea tag-urilor pentru a reîncărca datele dependente de utilizator
          // Acest lucru va face ca query-urile precum getUserDbAccounts să fie refăcute automat.
          if (dispatch) {
             dispatch(bankingApiSlice.util.invalidateTags(['UserAccount', 'UserTransaction', 'AuthStatus']));
          }

        } catch (error: any) { // Tipăm eroarea pentru a accesa proprietățile
          console.error('[bankingApi:loginUser:onQueryStarted] Login request failed:', error);
          // Poți accesa error.status și error.data dacă fetchBaseQuery aruncă un FetchBaseQueryError
          // if (error.status) {
          //   console.error('Login error status:', error.status);
          //   console.error('Login error data:', error.data);
          // }
        }
      }
    }),
    logoutUser: builder.mutation<void, void>({
        queryFn: (_arg, _queryApi, _extraOptions, _baseQuery) => { // Parametri standard pentru queryFn
            localStorage.removeItem('authToken');
            console.log('[bankingApi:logoutUser] Token REMOVED from localStorage.');
            // Opcional: Dispecerizează o acțiune pentru a actualiza starea de autentificare
            // if (_queryApi.dispatch && userLoggedOut) {
            //    _queryApi.dispatch(userLoggedOut());
            // }
            return { data: undefined }; // Trebuie să returneze un obiect cu `data` sau `error`
        },
        // Invalidează toate tag-urile care depind de starea de autentificare
        // pentru a curăța datele din cache la logout.
        invalidatesTags: ['UserAccount', 'UserTransaction', 'AuthStatus'],
    }),

    // --- DB Account Endpoints (Necesită Autentificare) ---
    createDbAccount: builder.mutation<IDbAccountResponseDTO, ICreateAccountRequestDTO>({
      query: (accountData) => {
        console.log('[bankingApi:createDbAccount] Query initiated with data:', accountData);
        return {
            url: '/api/v1/db-accounts',
            method: 'POST',
            body: accountData,
        };
      },
      invalidatesTags:  (_result, _error, _arg) => [{ type: 'UserAccount', id: 'LIST' }],
    }),
    getUserDbAccounts: builder.query<IDbAccountResponseDTO[], void>({
      query: () => {
        console.log('[bankingApi:getUserDbAccounts] Query initiated.');
        return '/api/v1/db-accounts';
      },
      providesTags: (result, _error, _arg) =>
        result && result.length > 0
          ? [
              ...result.map(({ id }) => ({ type: 'UserAccount' as const, id: id.toString() })), // Asigură-te că id-ul este string dacă așa e folosit
              { type: 'UserAccount' as const, id: 'LIST' },
            ]
          : [{ type: 'UserAccount' as const, id: 'LIST' }],
    }),
    getDbAccountDetails: builder.query<IDbAccountResponseDTO, string>({
      query: (accountNumber) => {
        console.log('[bankingApi:getDbAccountDetails] Query initiated for account:', accountNumber);
        return `/api/v1/db-accounts/${accountNumber}`;
      },
      providesTags: (_result, _error, accountNumber) => [{ type: 'UserAccount' as const, id: accountNumber }],
    }),

    // --- DB Transaction Endpoints (Necesită Autentificare) ---
    getAllUserTransactions: builder.query<IDbTransactionResponseDTO[], void>({
      query: () => {
        console.log('[bankingApi:getAllUserTransactions] Query initiated.');
        return '/api/v1/transactions';
      },
      providesTags: (result, _error, _arg) =>
        result && result.length > 0
          ? [
              ...result.map(({ id }) => ({ type: 'UserTransaction' as const, id: id.toString() })),
              { type: 'UserTransaction' as const, id: 'LIST' },
            ]
          : [{ type: 'UserTransaction' as const, id: 'LIST' }],
    }),
    getTransactionsForUserAccount: builder.query<IDbTransactionResponseDTO[], string>({
      query: (accountNumber) => {
        console.log('[bankingApi:getTransactionsForUserAccount] Query initiated for account:', accountNumber);
        return `/api/v1/transactions/${accountNumber}`;
      },
      providesTags: (_result, _error, accountNumber) => [
        { type: 'UserTransaction' as const, id: `ACCOUNT_${accountNumber}` },
        { type: 'UserTransaction' as const, id: 'LIST' },
      ],
    }),
  }),
});

// Exportă hook-urile generate automat
export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useCreateDbAccountMutation,
  useGetUserDbAccountsQuery,
  useLazyGetUserDbAccountsQuery,
  useGetDbAccountDetailsQuery,
  useGetAllUserTransactionsQuery,
  useLazyGetAllUserTransactionsQuery,
  useGetTransactionsForUserAccountQuery,
  useLazyGetTransactionsForUserAccountQuery,
} = bankingApiSlice;

export default bankingApiSlice;