import { useEffect, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Asigură-te că aceste căi sunt corecte pentru proiectul tău
import { IDomesticBankTransferRequest } from '../../entities/IDomesticBankTransferRequest'; 
import { useGetUserDbAccountsQuery, useMakeDomesticBankTransferMutation } from '../../store/bankingApi';
import useNotification from '../../shared/Notification/useNotification';
import './TransferForms.css';


// Schema de validare Zod
const domesticBankTransferSchema = z.object({
  sourceAccountId: z.string().min(1, "Contul sursă este obligatoriu."),
  destinationIban: z.string()
    .min(10, "IBAN-ul destinație este prea scurt.")
    .max(34, "IBAN-ul destinație este prea lung.")
    .regex(/^[A-Z0-9]+$/, "Format IBAN invalid. Folosiți doar litere mari și cifre."),
  beneficiaryName: z.string().min(2, "Numele beneficiarului este obligatoriu.").max(70, "Numele beneficiarului este prea lung."),
  beneficiaryBankName: z.string().min(3, "Numele băncii beneficiare este obligatoriu.").max(70, "Numele băncii este prea lung."),
  amount: z.coerce 
    .number({
      required_error: "Suma este obligatorie.",
      invalid_type_error: "Suma trebuie să fie un număr valid.",
    })
    .positive("Suma trebuie să fie mai mare ca zero.")
    .min(0.01, "Suma minimă pentru transfer este 0.01."),
  currency: z.string().length(3, "Moneda trebuie să aibă 3 caractere (ex: LEI)."),
  description: z.string().min(1, "Descrierea este obligatorie.").max(150, "Descrierea este prea lungă."),
});

type DomesticBankTransferFormValues = z.infer<typeof domesticBankTransferSchema>;

const DOMESTIC_TRANSFER_FEE_PERCENTAGE = 0.01; // 1% comision
const FEE_PERCENTAGE_DISPLAY = (DOMESTIC_TRANSFER_FEE_PERCENTAGE * 100).toFixed(0);

interface TransferDomesticBankFormProps {
  onCloseModal: () => void;
}

const TransferDomesticBankForm = ({ onCloseModal }: TransferDomesticBankFormProps) => {
  const { success: notifySuccess, error: notifyError } = useNotification();
  const { data: userAccounts, isLoading: isLoadingAccounts, isError: isErrorAccounts } = useGetUserDbAccountsQuery();
  const [makeTransfer, { isLoading: isTransferring }] = useMakeDomesticBankTransferMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid: isFormValid },
    reset,
    setValue,
  } = useForm<DomesticBankTransferFormValues>({
    resolver: zodResolver(domesticBankTransferSchema),
    mode: 'onChange',
    defaultValues: {
      sourceAccountId: '',
      destinationIban: '',
      beneficiaryName: '',
      beneficiaryBankName: '',
      amount: undefined,
      currency: 'LEI',
      description: '',
    }
  });

  const watchedSourceAccountId = watch('sourceAccountId');
  const watchedAmount = watch('amount');
  const watchedCurrency = watch('currency');

  const selectedSourceAccount = useMemo(() => {
    return userAccounts?.find(acc => acc.id.toString() === watchedSourceAccountId);
  }, [userAccounts, watchedSourceAccountId]);

  useEffect(() => {
    if (selectedSourceAccount) {
      setValue('currency', selectedSourceAccount.currency, { shouldValidate: true });
    } else {
      setValue('currency', 'LEI', { shouldValidate: true });
    }
  }, [selectedSourceAccount, setValue]);

  const { commission, totalAmountToPay, amountToSend } = useMemo(() => {
    const amountValue = watchedAmount;
    if (typeof amountValue === 'number' && amountValue > 0 && watchedCurrency) {
      const calculatedCommission = parseFloat((amountValue * DOMESTIC_TRANSFER_FEE_PERCENTAGE).toFixed(2));
      const calculatedTotal = parseFloat((amountValue + calculatedCommission).toFixed(2));
      return { commission: calculatedCommission, totalAmountToPay: calculatedTotal, amountToSend: amountValue };
    }
    return { commission: 0, totalAmountToPay: 0, amountToSend: 0 };
  }, [watchedAmount, watchedCurrency]);

  const onSubmit: SubmitHandler<DomesticBankTransferFormValues> = async (data) => {
    if (!selectedSourceAccount) {
      notifyError("Vă rugăm să selectați un cont sursă valid.");
      return;
    }

    const finalAmount = data.amount;
    const finalCommission = parseFloat((finalAmount * DOMESTIC_TRANSFER_FEE_PERCENTAGE).toFixed(2));
    const finalTotalToDebitInTransferCurrency = parseFloat((finalAmount + finalCommission).toFixed(2));

    if (data.currency === selectedSourceAccount.currency) {
      if (finalTotalToDebitInTransferCurrency > selectedSourceAccount.balance) {
        notifyError(`Fonduri insuficiente. Necesitați ${finalTotalToDebitInTransferCurrency.toLocaleString('ro-MD')} ${data.currency} (include comision). Sold: ${selectedSourceAccount.balance.toLocaleString('ro-MD')} ${selectedSourceAccount.currency}`);
        return;
      }
    } else {
      const confirmDifferentCurrencies = window.confirm(
        `Moneda transferului (${data.currency}) diferă de moneda contului sursă (${selectedSourceAccount.currency}). ` +
        `Suma totală (inclusiv comisionul) de ${finalTotalToDebitInTransferCurrency.toLocaleString('ro-MD')} ${data.currency} va fi convertită și debitată din contul sursă. Doriți să continuați?`
      );
      if (!confirmDifferentCurrencies) return;
    }
    
    const transferPayload: IDomesticBankTransferRequest = {
      fromAccountId: parseInt(data.sourceAccountId),
      toIban: data.destinationIban,
      beneficiaryName: data.beneficiaryName,
      beneficiaryBankName: data.beneficiaryBankName,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
    };

    try {
      await makeTransfer(transferPayload).unwrap();
      notifySuccess(`Transferul către ${data.beneficiaryName} a fost inițiat! Suma: ${data.amount.toLocaleString('ro-MD')} ${data.currency}, Comision: ${finalCommission.toLocaleString('ro-MD')} ${data.currency}.`);
      reset();
      onCloseModal();
    } catch (err) {
      console.error("Eroare la transferul interbancar național:", err);
      const apiError = err as { data?: { message?: string }, status?: number };
      const errorMessage = apiError?.data?.message || "A apărut o eroare la inițierea transferului.";
      notifyError(errorMessage);
    }
  };

  if (isLoadingAccounts) return <p className="form-message">Se încarcă conturile...</p>;
  if (isErrorAccounts || !userAccounts || userAccounts.length === 0) {
    return <p className="form-message error">Nu aveți conturi sursă disponibile sau a apărut o eroare.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="transfer-form">
      {/* Câmpul Din Contul */}
      <div className="form-field">
        <label htmlFor="sourceAccountIdDomestic">Din Contul:</label>
        <select id="sourceAccountIdDomestic" {...register("sourceAccountId")} disabled={isSubmitting || isTransferring}>
          <option value="">Alege cont sursă...</option>
          {userAccounts.map(account => (
            <option key={`source-dom-${account.id}`} value={account.id.toString()}>
              {account.accountTypeName} ({account.accountNumber}) - {account.balance.toLocaleString('ro-MD')} {account.currency}
            </option>
          ))}
        </select>
        {errors.sourceAccountId && <span className="error-message">{errors.sourceAccountId.message}</span>}
      </div>

      {/* Câmpul IBAN Destinatar */}
      <div className="form-field">
        <label htmlFor="destinationIbanDomestic">IBAN Destinatar (Altă Bancă):</label>
        <input type="text" id="destinationIbanDomestic" placeholder="MDXXBANKYYYYYYYYYYYYYYYY" {...register("destinationIban")} disabled={isSubmitting || isTransferring}/>
        {errors.destinationIban && <span className="error-message">{errors.destinationIban.message}</span>}
      </div>

      {/* Câmpul Nume Beneficiar */}
      <div className="form-field">
        <label htmlFor="beneficiaryNameDomestic">Nume Beneficiar:</label>
        <input type="text" id="beneficiaryNameDomestic" placeholder="Numele complet al beneficiarului" {...register("beneficiaryName")} disabled={isSubmitting || isTransferring}/>
        {errors.beneficiaryName && <span className="error-message">{errors.beneficiaryName.message}</span>}
      </div>

      {/* Câmpul Numele Băncii Beneficiare */}
      <div className="form-field">
        <label htmlFor="beneficiaryBankNameDomestic">Numele Băncii Beneficiare:</label>
        <input type="text" id="beneficiaryBankNameDomestic" placeholder="Ex: Moldova Agroindbank" {...register("beneficiaryBankName")} disabled={isSubmitting || isTransferring}/>
        {errors.beneficiaryBankName && <span className="error-message">{errors.beneficiaryBankName.message}</span>}
      </div>
      
      {/* Câmpul Suma de Transferat */}
      <div className="form-field">
        <label htmlFor="amountDomestic">Suma de Transferat:</label>
        <input 
          type="number" 
          id="amountDomestic" 
          step="0.01" 
          placeholder="0.00"
          {...register("amount")}
          disabled={isSubmitting || isTransferring}
        />
        {errors.amount && <span className="error-message">{errors.amount.message}</span>}
      </div>

      {/* Câmpul Moneda Transferului */}
      <div className="form-field">
        <label htmlFor="currencyDomestic">Moneda Transferului:</label>
        <input 
            type="text" 
            id="currencyDomestic" 
            {...register("currency")} 
            readOnly 
            className="input-readonly-style currency-display-input"
            disabled={isSubmitting || isTransferring}
        />
        {errors.currency && <span className="error-message">{errors.currency.message}</span>}
      </div>
      
      {/* Avertisment dacă monedele diferă - plasat după moneda, înainte de descriere */}
      {selectedSourceAccount && watchedCurrency !== selectedSourceAccount.currency && (
            <div className="form-field-warning currency-warning-standalone">
                <small className="currency-warning-message">
                    Atenție: Moneda transferului ({watchedCurrency}) diferă de moneda contului sursă ({selectedSourceAccount.currency}). Se vor aplica rate de schimb.
                </small>
            </div>
      )}

      {/* Câmpul Descrierea Plății */}
      <div className="form-field">
        <label htmlFor="descriptionDomestic">Descrierea Plății / Detalii:</label>
        <textarea 
          id="descriptionDomestic" 
          rows={3}
          placeholder="Ex: Plata factură Nr. 123 / Servicii"
          {...register("description")}
          disabled={isSubmitting || isTransferring}
        />
         {errors.description && <span className="error-message">{errors.description.message}</span>}
      </div>

      {/* Sumar Transfer și Notă Comision - plasate sub descriere, înainte de butoane */}
      {typeof amountToSend === 'number' && amountToSend > 0 && (
        <div className="transfer-details-summary"> {/* Un nou container pentru ambele note */}
          <div className="transfer-summary-block">
            <p>Veți transfera: <span>{amountToSend.toLocaleString('ro-MD')} {watchedCurrency}</span></p>
          </div>
          <div className="commission-note">
            <p>Comision ({FEE_PERCENTAGE_DISPLAY}%): <span>{commission.toLocaleString('ro-MD')} {watchedCurrency}</span></p>
            <p className="total-payable-note">Total de debitat (estimat): <span>{totalAmountToPay.toLocaleString('ro-MD')} {watchedCurrency}</span></p>
          </div>
        </div>
      )}

      {/* Acțiunile Formularului */}
      <div className="form-actions">
        <button type="button" onClick={onCloseModal} className="btn btn-secondary" disabled={isSubmitting || isTransferring}>
          Anulează
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting || isTransferring || !isFormValid}>
          {isSubmitting || isTransferring ? 'Se inițiază...' : 'Inițiază Transferul'}
        </button>
      </div>
    </form>
  );
};

export default TransferDomesticBankForm;