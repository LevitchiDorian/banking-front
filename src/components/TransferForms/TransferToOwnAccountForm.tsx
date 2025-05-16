import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useGetUserDbAccountsQuery, useMakeOwnAccountTransferMutation } from '../../store/bankingApi';
import { IDbAccountResponseDTO } from '../../entities/IDbAccountResponseDTO';
import useNotification from '../../shared/Notification/useNotification';
import './TransferForms.css';

interface TransferToOwnAccountFormProps {
  onCloseModal: () => void;
}

// Schema de validare cu Zod actualizată
const transferSchema = z.object({
  sourceAccountId: z.string().min(1, "Contul sursă este obligatoriu."),
  destinationAccountId: z.string().min(1, "Contul destinație este obligatoriu."),
  amount: z.coerce // Forțează conversia la număr
    .number({
      required_error: "Suma este obligatorie.",
      invalid_type_error: "Suma trebuie să fie un număr valid.",
    })
    .positive("Suma trebuie să fie mai mare ca zero.")
    .min(0.01, "Suma minimă pentru transfer este 0.01."),
  description: z.string().max(100, "Descrierea nu poate depăși 100 de caractere.").optional(),
}).refine(data => data.sourceAccountId !== data.destinationAccountId, {
  message: "Contul sursă și cel destinație nu pot fi identice.",
  path: ["destinationAccountId"],
});

type TransferFormValues = z.infer<typeof transferSchema>;

const TransferToOwnAccountForm = ({ onCloseModal }: TransferToOwnAccountFormProps) => {
  const { success: notifySuccess, error: notifyError } = useNotification();
  const { data: userAccounts, isLoading: isLoadingAccounts, isError: isErrorAccounts } = useGetUserDbAccountsQuery();
  const [makeTransfer, { isLoading: isTransferring }] = useMakeOwnAccountTransferMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
    reset
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      sourceAccountId: '',
      destinationAccountId: '',
      // amount: 0, // Poți începe cu 0 dacă dorești un placeholder numeric
      // Sau lasă-l undefined, Zod cu coerce ar trebui să gestioneze inputul gol ca eroare de "required"
      amount: undefined, 
      description: '',
    }
  });

  const [availableDestinationAccounts, setAvailableDestinationAccounts] = useState<IDbAccountResponseDTO[]>([]);
  const watchedSourceAccountId = watch('sourceAccountId');
  const watchedDestinationAccountId = watch('destinationAccountId');

  useEffect(() => {
    if (userAccounts && watchedSourceAccountId) {
      const filteredAccounts = userAccounts.filter(acc => acc.id.toString() !== watchedSourceAccountId);
      setAvailableDestinationAccounts(filteredAccounts);
      if (watchedDestinationAccountId === watchedSourceAccountId && watchedSourceAccountId !== '') {
        setValue('destinationAccountId', '');
      }
    } else if (userAccounts) {
      setAvailableDestinationAccounts(userAccounts);
    } else {
      setAvailableDestinationAccounts([]);
    }
  // Adaugă 'watch' ca dependență dacă ESLint o cere, deși funcțional nu e strict necesar aici pentru 'watchedDestinationAccountId'
  }, [watchedSourceAccountId, userAccounts, setValue, watchedDestinationAccountId]); 

  const onSubmit: SubmitHandler<TransferFormValues> = async (data) => {
    // 'data.amount' este garantat a fi un număr aici dacă validarea Zod a trecut
    const sourceAccount = userAccounts?.find(acc => acc.id.toString() === data.sourceAccountId);

    if (!sourceAccount) { // destinationAccountId este validat de Zod că nu e gol
      notifyError("Contul sursă selectat nu este valid.");
      return;
    }
    
    if (data.amount > sourceAccount.balance) {
      notifyError(`Fonduri insuficiente în contul sursă. Sold disponibil: ${sourceAccount.balance.toLocaleString('ro-MD')} ${sourceAccount.currency}`);
      // Nu mai e nevoie să facem setValue('amount', undefined) aici,
      // utilizatorul va trebui să corecteze manual.
      return;
    }
    
    const destinationAccount = userAccounts?.find(acc => acc.id.toString() === data.destinationAccountId);
    if (destinationAccount && sourceAccount.currency !== destinationAccount.currency) {
        const confirmDifferentCurrency = window.confirm(
            `Atenție: Conturile selectate au monede diferite (${sourceAccount.currency} -> ${destinationAccount.currency}). Continuați? (Conversia valutară poate eșua în backend.)`
          );
          if (!confirmDifferentCurrency) {
            return; 
          }
    }

    try {
      await makeTransfer({
        fromAccountId: parseInt(data.sourceAccountId),
        toAccountId: parseInt(data.destinationAccountId),
        amount: data.amount, // Este deja număr
        description: data.description,
      }).unwrap();
      notifySuccess('Transferul între conturile proprii a fost efectuat cu succes!');
      reset(); // Resetează la defaultValues
      onCloseModal();
    } catch (err) {
      console.error("Eroare la transferul între conturi proprii:", err);
      const apiError = err as { data?: { message?: string }, status?: number };
      const errorMessage = apiError?.data?.message || "A apărut o eroare la efectuarea transferului.";
      notifyError(errorMessage);
    }
  };

  if (isLoadingAccounts) return <p className="form-message">Se încarcă conturile...</p>;
  if (isErrorAccounts) return <p className="form-message error">Eroare la încărcarea conturilor.</p>;
  if (!userAccounts || userAccounts.length === 0) {
    return <p className="form-message">Nu aveți conturi disponibile.</p>;
  }
  // Simplificăm logica de afișare, validarea Zod se ocupă de restul
  // if (userAccounts.length < 2) {
  //   return <p className="form-message">Necesitați cel puțin două conturi diferite pentru a efectua un transfer între ele.</p>;
  // }

  const selectedSourceAccountForCurrency = userAccounts.find(acc => acc.id.toString() === watchedSourceAccountId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="transfer-form">
      <div className="form-field">
        <label htmlFor="sourceAccountId">Din Contul:</label>
        <select id="sourceAccountId" {...register("sourceAccountId")} disabled={isSubmitting || isTransferring}>
          <option value="">Alege cont sursă...</option>
          {userAccounts.map(account => (
            <option key={`source-${account.id}`} value={account.id.toString()}>
              {account.accountTypeName} ({account.accountNumber}) - {account.balance.toLocaleString('ro-MD')} {account.currency}
            </option>
          ))}
        </select>
        {errors.sourceAccountId && <span className="error-message">{errors.sourceAccountId.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="destinationAccountId">În Contul:</label>
        <select id="destinationAccountId" {...register("destinationAccountId")} disabled={isSubmitting || isTransferring || !watchedSourceAccountId}>
          <option value="">Alege cont destinație...</option>
          {availableDestinationAccounts.map(account => (
            <option key={`dest-${account.id}`} value={account.id.toString()}>
              {account.accountTypeName} ({account.accountNumber}) - {account.balance.toLocaleString('ro-MD')} {account.currency}
            </option>
          ))}
        </select>
        {errors.destinationAccountId && <span className="error-message">{errors.destinationAccountId.message}</span>}
      </div>
      
      <div className="form-field">
        <label htmlFor="amount">Sumă{selectedSourceAccountForCurrency ? ` (${selectedSourceAccountForCurrency.currency})` : ''}:</label>
        <input 
          type="number" 
          id="amount" 
          step="0.01" 
          placeholder="0.00"
          {...register("amount")} // Zod cu coerce se ocupă de conversie
          disabled={isSubmitting || isTransferring}
        />
        {errors.amount && <span className="error-message">{errors.amount.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="description">Descriere (Opțional):</label>
        <textarea 
          id="description" 
          rows={3}
          placeholder="Ex: Transfer economii lunare"
          {...register("description")}
          disabled={isSubmitting || isTransferring}
        />
        {errors.description && <span className="error-message">{errors.description.message}</span>}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCloseModal} className="btn btn-secondary" disabled={isSubmitting || isTransferring}>
          Anulează
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting || isTransferring}>
          {isSubmitting || isTransferring ? 'Se transferă...' : 'Efectuează Transferul'}
        </button>
      </div>
    </form>
  );
};

export default TransferToOwnAccountForm;