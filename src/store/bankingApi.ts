import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IUserDTO } from '../entities/IUserDTO';
import { ILoginResponse } from '../entities/ILoginResponse';
import { ICreateAccountRequestDTO } from '../entities/ICreateAccountRequestDTO';
import { IDbAccountResponseDTO } from '../entities/IDbAccountResponseDTO';
import { IDbTransactionResponseDTO } from '../entities/IDbTransactionResponseDTO';
import { ITransferSuccessResponse } from '../entities/ITransferSuccessResponse'; // Probabil poți reutiliza acest tip pentru răspuns
import { IOwnAccountTransferRequest } from '../entities/IOwnAccountTransferRequest';
import { IIntrabankTransferRequest } from '../entities/IIntrabankTransferRequest';
import { IDomesticBankTransferRequest } from '../entities/IDomesticBankTransferRequest';
import { IBillPaymentRequestDTO } from '../entities/IBillPaymentRequestDTO'; // Importă noul DTO
import { IMiaPaymentRequest } from '../entities/IMiaPaymentRequest'; // Importă noul DTO
import { ISwiftPaymentRequest } from '../entities/ISwiftPaymentRequest'; // Importă noul DTO
import { ISepaPaymentRequest } from '../entities/ISepaPaymentRequest'; // Importă noul DTO

const getToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  // console.log('[bankingApi:getToken] Retrieved token from localStorage:', token ? token.substring(0, 20) + "..." : null);
  return token;
};

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8081',
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const bankingApiSlice = createApi({
  reducerPath: 'bankingApi',
  baseQuery: baseQuery,
  tagTypes: ['UserAccount', 'UserTransaction', 'AuthStatus'], // Păstrează tag-urile existente
  endpoints: (builder) => ({
    // --- Auth Endpoints ---
    // ... (registerUser, loginUser, logoutUser - neschimbate) ...
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
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem('authToken', data.token);
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
            if (_queryApi.dispatch) {
                _queryApi.dispatch(bankingApiSlice.util.invalidateTags(['UserAccount', 'UserTransaction', 'AuthStatus']));
            }
            return { data: undefined };
        },
    }),

    // --- DB Account Endpoints ---
    // ... (createDbAccount, getUserDbAccounts, getDbAccountDetails - neschimbate) ...
    createDbAccount: builder.mutation<IDbAccountResponseDTO, ICreateAccountRequestDTO>({
      query: (accountData) => ({
        url: '/api/v1/db-accounts',
        method: 'POST',
        body: accountData,
      }),
      invalidatesTags:  [{ type: 'UserAccount', id: 'LIST' }],
    }),
    getUserDbAccounts: builder.query<IDbAccountResponseDTO[], void>({
      query: () => '/api/v1/db-accounts',
      providesTags: (result) =>
        result && result.length > 0
          ? [
              ...result.map(({ id }) => ({ type: 'UserAccount' as const, id: id.toString() })),
              { type: 'UserAccount' as const, id: 'LIST' },
            ]
          : [{ type: 'UserAccount' as const, id: 'LIST' }],
    }),
    getDbAccountDetails: builder.query<IDbAccountResponseDTO, string>({
      query: (accountNumber) => `/api/v1/db-accounts/${accountNumber}`,
      providesTags: (_result, _error, accountNumber) => [{ type: 'UserAccount' as const, id: accountNumber }],
    }),
    
    // --- Download Statement Endpoint ---
    // ... (downloadAccountStatement - neschimbat, dar asigură-te că este aici) ...
    downloadAccountStatement: builder.query<Blob, { accountNumber: string; startDate: string; endDate: string }>({
      query: ({ accountNumber, startDate, endDate }) => ({
        url: `/api/v1/accounts/${accountNumber}/statement`,
        method: 'GET',
        params: { startDate, endDate },
        responseHandler: async (response) => {
          if (!response.ok) {
            let errorData;
            try { errorData = await response.json(); } catch (e) { errorData = { message: await response.text() }; }
            throw { status: response.status, data: errorData };
          }
          return response.blob();
        },
        cache: 'no-cache',
      }),
    }),

    // --- DB Transaction Endpoints ---
    // ... (getAllUserTransactions, getTransactionsForUserAccount - neschimbate) ...
     getAllUserTransactions: builder.query<IDbTransactionResponseDTO[], void>({
      query: () => '/api/v1/transactions',
      providesTags: (result) =>
        result && result.length > 0
          ? [
              ...result.map(({ id }) => ({ type: 'UserTransaction' as const, id: id.toString() })),
              { type: 'UserTransaction' as const, id: 'LIST' },
            ]
          : [{ type: 'UserTransaction' as const, id: 'LIST' }],
    }),
    getTransactionsForUserAccount: builder.query<IDbTransactionResponseDTO[], string>({
      query: (accountNumber) => `/api/v1/transactions/${accountNumber}`,
      providesTags: (_result, _error, accountNumber) => [
        { type: 'UserTransaction' as const, id: `ACCOUNT_${accountNumber}` },
        { type: 'UserTransaction' as const, id: 'LIST' },
      ],
    }),

    // --- Transfer Endpoints ---
    // ... (makeOwnAccountTransfer, makeIntrabankTransfer, makeDomesticBankTransfer - neschimbate) ...
    makeOwnAccountTransfer: builder.mutation<ITransferSuccessResponse, IOwnAccountTransferRequest>({
      query: (transferDetails) => ({
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
      query: (transferDetails) => ({
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
      query: (transferDetails) => ({
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

    // --- ADĂUGAT: Bill Payment Endpoint ---
    makeBillPayment: builder.mutation<ITransferSuccessResponse, IBillPaymentRequestDTO>({
      query: (paymentDetails) => ({
        url: '/api/v1/payments/bill',
        method: 'POST',
        body: paymentDetails,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'UserAccount', id: arg.fromAccountId.toString() }, // Invalidează contul debitat
        { type: 'UserAccount', id: 'LIST' }, // Invalidează lista generală de conturi
        { type: 'UserTransaction', id: 'LIST' }, // Invalidează lista generală de tranzacții
        // Invalidează tranzacțiile specifice contului debitat
        { type: 'UserTransaction', id: `ACCOUNT_${arg.fromAccountId.toString()}`}, 
      ],
    }),

    // --- NOI PAYMENT ENDPOINTS PENTRU MIA, SWIFT, SEPA ---
    makeMiaPayment: builder.mutation<ITransferSuccessResponse, IMiaPaymentRequest>({
      query: (paymentDetails) => ({
        url: '/api/v1/transfers/mia', // Endpoint definit în TransferController
        method: 'POST',
        body: paymentDetails,
      }),
      invalidatesTags: (_result, _error, arg) => [ // Tag-uri de invalidare standard
        { type: 'UserAccount', id: arg.fromAccountId.toString() },
        { type: 'UserAccount', id: 'LIST' },
        { type: 'UserTransaction', id: 'LIST' },
        { type: 'UserTransaction', id: `ACCOUNT_${arg.fromAccountId.toString()}`},
      ],
    }),

    makeSwiftPayment: builder.mutation<ITransferSuccessResponse, ISwiftPaymentRequest>({
      query: (paymentDetails) => ({
        url: '/api/v1/transfers/swift', // Endpoint definit în TransferController
        method: 'POST',
        body: paymentDetails,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'UserAccount', id: arg.fromAccountId.toString() },
        { type: 'UserAccount', id: 'LIST' },
        { type: 'UserTransaction', id: 'LIST' },
        { type: 'UserTransaction', id: `ACCOUNT_${arg.fromAccountId.toString()}`},
      ],
    }),

    makeSepaPayment: builder.mutation<ITransferSuccessResponse, ISepaPaymentRequest>({
      query: (paymentDetails) => ({
        url: '/api/v1/transfers/sepa', // Endpoint definit în TransferController
        method: 'POST',
        body: paymentDetails,
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

// Copiază toate exporturile existente și adaugă cele noi
export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useCreateDbAccountMutation,
  useGetUserDbAccountsQuery,
  useLazyGetUserDbAccountsQuery,
  useGetDbAccountDetailsQuery,
  useLazyDownloadAccountStatementQuery,
  useGetAllUserTransactionsQuery,
  useLazyGetAllUserTransactionsQuery,
  useGetTransactionsForUserAccountQuery,
  useLazyGetTransactionsForUserAccountQuery,
  useMakeOwnAccountTransferMutation,
  useMakeIntrabankTransferMutation,
  useMakeDomesticBankTransferMutation,
  useMakeBillPaymentMutation,
  // Exportă noile hook-uri
  useMakeMiaPaymentMutation,
  useMakeSwiftPaymentMutation,
  useMakeSepaPaymentMutation,
} = bankingApiSlice;

export default bankingApiSlice;