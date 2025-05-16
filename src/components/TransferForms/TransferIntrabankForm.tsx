// import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useGetUserDbAccountsQuery } from '../../store/bankingApi'; // Pentru conturile sursă
// import { useMakeIntrabankTransferMutation } from '../../store/bankingApi'; // Mutația RTK
// import { IDbAccountResponseDTO } from '../../entities/IDbAccountResponseDTO';
import useNotification from '../../shared/Notification/useNotification'; // Hook pentru notificări
import './TransferForms.css'

interface TransferIntrabankFormProps {
  onCloseModal: () => void;
}

// Schema de validare pentru transfer intrabancar
const intrabankTransferSchema = z.object({
  sourceAccountId: z.string().min(1, "Contul sursă este obligatoriu"),
  destinationIban: z.string()
    .min(10, "IBAN-ul destinație este prea scurt") // Ajustează lungimea minimă/maximă conform standardelor IBAN MD
    .max(34, "IBAN-ul destinație este prea lung")
    .regex(/^[A-Z0-9]+$/, "IBAN-ul poate conține doar litere mari și cifre"), // Validare simplă format IBAN
  beneficiaryName: z.string().min(2, "Numele beneficiarului este obligatoriu"),
  amount: z.number().positive("Suma trebuie să fie un număr pozitiv"),
  description: z.string().optional(),
});

type IntrabankTransferFormValues = z.infer<typeof intrabankTransferSchema>;

const TransferIntrabankForm = ({ onCloseModal }: TransferIntrabankFormProps) => {
  const { success: notifySuccess, error: notifyError } = useNotification();
  const { data: userAccounts, isLoading: isLoadingAccounts } = useGetUserDbAccountsQuery();
  // const [makeTransfer, { isLoading: isTransferring }] = useMakeIntrabankTransferMutation();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm<IntrabankTransferFormValues>({
    resolver: zodResolver(intrabankTransferSchema),
    defaultValues: {
        amount: 0,
        description: '',
    }
  });

  const sourceAccountId = watch('sourceAccountId');
  const selectedSourceAccount = userAccounts?.find(acc => acc.id.toString() === sourceAccountId);

  const onSubmit: SubmitHandler<IntrabankTransferFormValues> = async (data) => {
    console.log("Date formular pentru transfer intrabancar:", data);
    try {
    //   await makeTransfer({
    //     fromAccountId: parseInt(data.sourceAccountId),
    //     toIban: data.destinationIban,
    //     beneficiaryName: data.beneficiaryName,
    //     amount: data.amount,
    //     description: data.description,
    //     currency: selectedSourceAccount?.currency || 'LEI' // Trimite moneda contului sursă
    //   }).unwrap();
      notifySuccess('Transferul intrabancar a fost efectuat cu succes!');
      reset();
      onCloseModal();
    } catch (err) {
      console.error("Eroare la transferul intrabancar:", err);
      const errorMessage = (err as any)?.data?.message || "A apărut o eroare la efectuarea transferului.";
      notifyError(errorMessage);
    }
  };

  if (isLoadingAccounts) return <p className="form-message">Se încarcă conturile...</p>;
  if (!userAccounts || userAccounts.length === 0) {
    return <p className="form-message error">Nu aveți conturi disponibile pentru a iniția un transfer.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="transfer-form">
      <div className="form-field">
        <label htmlFor="sourceAccountIdIntra">Din Contul:</label>
        <select id="sourceAccountIdIntra" {...register("sourceAccountId")} disabled={isSubmitting}>
          <option value="">Selectează contul sursă</option>
          {userAccounts.map(account => (
            <option key={account.id} value={account.id.toString()}>
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
          placeholder="Introdu IBAN-ul beneficiarului"
          {...register("destinationIban")}
          disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
        {errors.beneficiaryName && <span className="error-message">{errors.beneficiaryName.message}</span>}
      </div>
      
      <div className="form-field">
        <label htmlFor="amountIntra">Sumă{selectedSourceAccount ? ` (${selectedSourceAccount.currency})` : ''}:</label>
        <input 
          type="number" 
          id="amountIntra" 
          step="0.01" 
          placeholder="0.00"
          {...register("amount", { valueAsNumber: true })}
          disabled={isSubmitting}
        />
        {errors.amount && <span className="error-message">{errors.amount.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="descriptionIntra">Descriere (Opțional):</label>
        <textarea 
          id="descriptionIntra" 
          rows={3}
          placeholder="Ex: Cadou, Plata serviciu"
          {...register("description")}
          disabled={isSubmitting}
        />
         {errors.description && <span className="error-message">{errors.description.message}</span>}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCloseModal} className="btn btn-secondary" disabled={isSubmitting}>
          Anulează
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting /* || isTransferring */}>
          {isSubmitting /* || isTransferring */ ? 'Se transferă...' : 'Efectuează Transferul'}
        </button>
      </div>
    </form>
  );
};

export default TransferIntrabankForm;