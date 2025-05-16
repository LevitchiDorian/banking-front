import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IUserDTO } from '../entities/IUserDTO';
import { ILoginResponse } from '../entities/ILoginResponse';
import { ICreateAccountRequestDTO } from '../entities/ICreateAccountRequestDTO';
import { IDbAccountResponseDTO } from '../entities/IDbAccountResponseDTO';
import { IDbTransactionResponseDTO } from '../entities/IDbTransactionResponseDTO';
import { ITransferSuccessResponse } from '../entities/ITransferSuccessResponse';
import { IOwnAccountTransferRequest } from '../entities/IOwnAccountTransferRequest';
import { IIntrabankTransferRequest } from '../entities/IIntrabankTransferRequest';
import { IDomesticBankTransferRequest } from '../entities/IDomesticBankTransferRequest';


const getToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  console.log('[bankingApi:getToken] Retrieved token from localStorage:', token ? token.substring(0, 20) + "..." : null);
  return token;
};

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8081',
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      // console.log('[bankingApi:prepareHeaders] Authorization header SET with token:', token.substring(0, 20) + "...");
    } else {
      // console.warn('[bankingApi:prepareHeaders] No token found, Authorization header NOT SET.');
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const bankingApiSlice = createApi({
  reducerPath: 'bankingApi',
  baseQuery: baseQuery,
  tagTypes: ['UserAccount', 'UserTransaction', 'AuthStatus'],
  endpoints: (builder) => ({
    // --- Auth Endpoints ---
    registerUser: builder.mutation<string, IUserDTO>({
      query: (userCredentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: userCredentials,
      }),
    }),
    loginUser: builder.mutation<ILoginResponse, IUserDTO>({
      query: (userCredentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: userCredentials,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        // console.log('[bankingApi:loginUser:onQueryStarted] Attempting login...');
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem('authToken', data.token);
          // console.log('[bankingApi:loginUser:onQueryStarted] Login successful. Token SAVED to localStorage:', data.token ? data.token.substring(0, 20) + "..." : null);
          if (dispatch) {
             dispatch(bankingApiSlice.util.invalidateTags(['UserAccount', 'UserTransaction', 'AuthStatus']));
          }
        } catch (error: any) {
          console.error('[bankingApi:loginUser:onQueryStarted] Login request failed:', error);
        }
      }
    }),
    logoutUser: builder.mutation<void, void>({
        queryFn: (_arg, _queryApi, _extraOptions, _baseQuery) => {
            localStorage.removeItem('authToken');
            // console.log('[bankingApi:logoutUser] Token REMOVED from localStorage.');
            if (_queryApi.dispatch) { // Invalidează tag-urile prin dispatch
                _queryApi.dispatch(bankingApiSlice.util.invalidateTags(['UserAccount', 'UserTransaction', 'AuthStatus']));
            }
            return { data: undefined };
        },
        // Nu mai este necesar invalidatesTags aici dacă se face prin dispatch în queryFn
    }),

    // --- DB Account Endpoints ---
    createDbAccount: builder.mutation<IDbAccountResponseDTO, ICreateAccountRequestDTO>({
      query: (accountData) => ({
        url: '/api/v1/db-accounts',
        method: 'POST',
        body: accountData,
      }),
      invalidatesTags:  [{ type: 'UserAccount', id: 'LIST' }],
    }),
    getUserDbAccounts: builder.query<IDbAccountResponseDTO[], void>({
      query: () => '/api/v1/db-accounts', // Funcția query returnează un string (URL)
      providesTags: (result) =>
        result && result.length > 0
          ? [
              ...result.map(({ id }) => ({ type: 'UserAccount' as const, id: id.toString() })),
              { type: 'UserAccount' as const, id: 'LIST' },
            ]
          : [{ type: 'UserAccount' as const, id: 'LIST' }],
    }),
    getDbAccountDetails: builder.query<IDbAccountResponseDTO, string>({
      query: (accountNumber) => `/api/v1/db-accounts/${accountNumber}`, // Funcția query returnează un string (URL)
      providesTags: (_result, _error, accountNumber) => [{ type: 'UserAccount' as const, id: accountNumber }],
    }),

    // --- DB Transaction Endpoints ---
    getAllUserTransactions: builder.query<IDbTransactionResponseDTO[], void>({
      query: () => '/api/v1/transactions', // Funcția query returnează un string (URL)
      providesTags: (result) =>
        result && result.length > 0
          ? [
              ...result.map(({ id }) => ({ type: 'UserTransaction' as const, id: id.toString() })),
              { type: 'UserTransaction' as const, id: 'LIST' },
            ]
          : [{ type: 'UserTransaction' as const, id: 'LIST' }],
    }),
    getTransactionsForUserAccount: builder.query<IDbTransactionResponseDTO[], string>({
      query: (accountNumber) => `/api/v1/transactions/${accountNumber}`, // Funcția query returnează un string (URL)
      providesTags: (_result, _error, accountNumber) => [
        { type: 'UserTransaction' as const, id: `ACCOUNT_${accountNumber}` },
        { type: 'UserTransaction' as const, id: 'LIST' },
      ],
    }),

    // --- Transfer Endpoints ---
    makeOwnAccountTransfer: builder.mutation<ITransferSuccessResponse, IOwnAccountTransferRequest>({
      query: (transferDetails) => ({ // Funcția query returnează un obiect
        url: '/api/v1/transfers/own-account',
        method: 'POST',
        body: transferDetails,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'UserAccount', id: arg.fromAccountId.toString() },
        { type: 'UserAccount', id: arg.toAccountId.toString() },
        { type: 'UserAccount', id: 'LIST' },
        { type: 'UserTransaction', id: 'LIST' },
        { type: 'UserTransaction', id: `ACCOUNT_${arg.fromAccountId.toString()}`},
        { type: 'UserTransaction', id: `ACCOUNT_${arg.toAccountId.toString()}`},
      ],
    }),

    makeIntrabankTransfer: builder.mutation<ITransferSuccessResponse, IIntrabankTransferRequest>({
      query: (transferDetails) => ({ // Funcția query returnează un obiect
        url: '/api/v1/transfers/intrabank',
        method: 'POST',
        body: transferDetails,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'UserAccount', id: arg.fromAccountId.toString() },
        { type: 'UserAccount', id: 'LIST' },
        { type: 'UserTransaction', id: 'LIST' },
        { type: 'UserTransaction', id: `ACCOUNT_${arg.fromAccountId.toString()}`},
      ],
    }),

    makeDomesticBankTransfer: builder.mutation<ITransferSuccessResponse, IDomesticBankTransferRequest>({
      query: (transferDetails) => ({ // Funcția query returnează un obiect
        url: '/api/v1/transfers/domestic-bank',
        method: 'POST',
        body: transferDetails,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'UserAccount', id: arg.fromAccountId.toString() },
        { type: 'UserAccount', id: 'LIST' },
        { type: 'UserTransaction', id: 'LIST' },
        { type: 'UserTransaction', id: `ACCOUNT_${arg.fromAccountId.toString()}`},
      ],
    }),
  }),
});

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
  useMakeOwnAccountTransferMutation,
  useMakeIntrabankTransferMutation,
  useMakeDomesticBankTransferMutation,
} = bankingApiSlice;

export default bankingApiSlice;