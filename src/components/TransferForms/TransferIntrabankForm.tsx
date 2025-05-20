import React from 'react'; // Import React dacă nu e importat global prin JSX transform
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useGetUserDbAccountsQuery, useMakeIntrabankTransferMutation } from '../../store/bankingApi'; // Asigură-te că ai importat useMakeIntrabankTransferMutation
// import { IDbAccountResponseDTO } from '../../entities/IDbAccountResponseDTO'; // Nu este necesar direct aici dacă nu-l folosești specific
import useNotification from '../../shared/Notification/useNotification'; // Ajustează calea dacă e necesar
import './TransferForms.css'; // CSS-ul comun pentru formulare

interface TransferIntrabankFormProps {
  onCloseModal: () => void;
}

// Schema de validare cu Zod pentru transfer intrabancar
// Am adăugat validare pentru moneda și am actualizat amount să folosească coerce
const intrabankTransferSchema = z.object({
  sourceAccountId: z.string().min(1, "Contul sursă este obligatoriu."),
  destinationIban: z.string()
    .min(10, "IBAN-ul destinație este prea scurt.")
    .max(34, "IBAN-ul destinație este prea lung.")
    .regex(/^[A-Z0-9]+$/, "IBAN-ul poate conține doar litere mari și cifre."),
  beneficiaryName: z.string().min(2, "Numele beneficiarului este obligatoriu.").max(100, "Numele beneficiarului este prea lung."),
  amount: z.coerce // Forțează conversia la număr
    .number({
      required_error: "Suma este obligatorie.",
      invalid_type_error: "Suma trebuie să fie un număr valid.",
    })
    .positive("Suma trebuie să fie mai mare ca zero.")
    .min(0.01, "Suma minimă pentru transfer este 0.01."),
  currency: z.string().length(3, "Moneda trebuie să aibă 3 caractere (ex: LEI, USD)."), // Am adăugat currency
  description: z.string().max(100, "Descrierea nu poate depăși 100 de caractere.").optional(),
});

type IntrabankTransferFormValues = z.infer<typeof intrabankTransferSchema>;

const TransferIntrabankForm = ({ onCloseModal }: TransferIntrabankFormProps) => {
  const { success: notifySuccess, error: notifyError } = useNotification();
  const { data: userAccounts, isLoading: isLoadingAccounts, isError: isErrorAccounts } = useGetUserDbAccountsQuery();
  
  // Hook-ul de mutație pentru transferul intrabancar
  const [makeTransfer, { isLoading: isTransferring }] = useMakeIntrabankTransferMutation();

  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors, isSubmitting }, // isSubmitting este de la react-hook-form
    reset,
    setValue // Pentru a seta moneda dinamic
  } = useForm<IntrabankTransferFormValues>({
    resolver: zodResolver(intrabankTransferSchema),
    defaultValues: {
      sourceAccountId: '',
      destinationIban: '',
      beneficiaryName: '',
      amount: undefined, // Zod cu coerce va gestiona
      currency: '',    // Inițial gol, se va seta dinamic
      description: '',
    }
  });

  const watchedSourceAccountId = watch('sourceAccountId');
  const selectedSourceAccount = userAccounts?.find(acc => acc.id.toString() === watchedSourceAccountId);

  // Setează automat moneda în formular când se selectează un cont sursă
  React.useEffect(() => {
    if (selectedSourceAccount) {
      setValue('currency', selectedSourceAccount.currency, { shouldValidate: true });
    } else {
      setValue('currency', '', { shouldValidate: true }); // Golește dacă nu e selectat niciun cont
    }
  }, [selectedSourceAccount, setValue]);


  const onSubmit: SubmitHandler<IntrabankTransferFormValues> = async (data) => {
    if (!selectedSourceAccount) {
        notifyError("Vă rugăm selectați un cont sursă valid.");
        return;
    }

    // Verificare suplimentară fonduri client-side (backend-ul face validarea finală)
    if (data.amount > selectedSourceAccount.balance && data.currency === selectedSourceAccount.currency) {
        notifyError(`Fonduri insuficiente în contul sursă. Sold disponibil: ${selectedSourceAccount.balance.toLocaleString('ro-MD')} ${selectedSourceAccount.currency}`);
        return;
    }
    // Dacă monedele diferă, această verificare de sold e mai complexă și ar trebui lăsată pe seama backend-ului
    // sau implementată cu conversie valutară pe client.


    console.log("Trimitere date transfer intrabancar:", {
        fromAccountId: parseInt(data.sourceAccountId),
        toIban: data.destinationIban,
        beneficiaryName: data.beneficiaryName,
        amount: data.amount,
        currency: data.currency, // Trimitem moneda selectată/dedusă
        description: data.description,
    });

    try {
      await makeTransfer({
        fromAccountId: parseInt(data.sourceAccountId),
        toIban: data.destinationIban,
        beneficiaryName: data.beneficiaryName,
        amount: data.amount, // Este deja număr datorită Zod
        currency: data.currency, // Trimite moneda către backend
        description: data.description,
      }).unwrap(); // .unwrap() pentru a prinde erorile RTK Query și a obține răspunsul de succes

      notifySuccess('Transferul intrabancar a fost efectuat cu succes!');
      reset(); // Golește formularul
      onCloseModal(); // Închide modalul
    } catch (err) {
      console.error("Eroare la transferul intrabancar:", err);
      // Extrage mesajul de eroare din răspunsul API dacă există
      const apiError = err as { data?: { message?: string }, status?: number };
      const errorMessage = apiError?.data?.message || "A apărut o eroare la efectuarea transferului.";
      notifyError(errorMessage);
    }
  };

  if (isLoadingAccounts) return <p className="form-message">Se încarcă conturile...</p>;
  if (isErrorAccounts) return <p className="form-message error">Eroare la încărcarea conturilor.</p>;
  if (!userAccounts || userAccounts.length === 0) {
    return <p className="form-message error">Nu aveți conturi disponibile pentru a iniția un transfer.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="transfer-form">
      <div className="form-field">
        <label htmlFor="sourceAccountIdIntra">Din Contul:</label>
        <select 
          id="sourceAccountIdIntra" 
          {...register("sourceAccountId")} 
          disabled={isSubmitting || isTransferring}
        >
          <option value="">Alege cont sursă...</option>
          {userAccounts.map(account => (
            <option key={`source-intra-${account.id}`} value={account.id.toString()}>
              {account.accountTypeName} ({account.accountNumber}) - {account.balance.toLocaleString('ro-MD')} {account.currency}
            </option>
          ))}
        </select>
        {errors.sourceAccountId && <span className="error-message">{errors.sourceAccountId.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="destinationIbanIntra">IBAN Destinatar (Digital Banking):</label>
        <input
          type="text"
          id="destinationIbanIntra"
          placeholder="MDXXBANKYYYYYYYYYYYYYYYY"
          {...register("destinationIban")}
          disabled={isSubmitting || isTransferring}
          // Poți adăuga aici un maxLength pentru IBAN dacă este cazul
        />
        {errors.destinationIban && <span className="error-message">{errors.destinationIban.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="beneficiaryNameIntra">Nume Beneficiar:</label>
        <input
          type="text"
          id="beneficiaryNameIntra"
          placeholder="Numele complet al beneficiarului"
          {...register("beneficiaryName")}
          disabled={isSubmitting || isTransferring}
        />
        {errors.beneficiaryName && <span className="error-message">{errors.beneficiaryName.message}</span>}
      </div>
      
      <div className="form-field">
        <label htmlFor="amountIntra">Sumă:</label>
        <input 
          type="number" 
          id="amountIntra" 
          step="0.01" 
          placeholder="0.00"
          {...register("amount")}
          disabled={isSubmitting || isTransferring}
        />
        {errors.amount && <span className="error-message">{errors.amount.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="currencyIntra">Moneda Transferului:</label>
        <select 
            id="currencyIntra" 
            {...register("currency")} 
            disabled={isSubmitting || isTransferring || !selectedSourceAccount} // Se poate edita sau e dedusă?
        >
            {/* Dacă moneda e mereu cea a contului sursă, nu e nevoie de select. Altfel, populează opțiunile. */}
            {selectedSourceAccount ? (
                <option value={selectedSourceAccount.currency}>{selectedSourceAccount.currency}</option>
            ) : (
                <option value="">Selectează contul sursă mai întâi</option>
            )}
            {/* Sau dacă permiți selectarea monedei: */}
            {/* <option value="LEI">LEI</option> */}
            {/* <option value="USD">USD</option> */}
            {/* <option value="EUR">EUR</option> */}
        </select>
        {errors.currency && <span className="error-message">{errors.currency.message}</span>}
      </div>


      <div className="form-field">
        <label htmlFor="descriptionIntra">Descriere (Opțional):</label>
        <textarea 
          id="descriptionIntra" 
          rows={3}
          placeholder="Ex: Cadou, Plata chirie"
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

export default TransferIntrabankForm;