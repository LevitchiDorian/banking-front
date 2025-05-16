// import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useGetUserDbAccountsQuery } from '../../store/bankingApi';
// import { useMakeDomesticBankTransferMutation } from '../../store/bankingApi';
import useNotification from '../../shared/Notification/useNotification';
import './TransferForms.css';

interface TransferDomesticBankFormProps {
  onCloseModal: () => void;
}

// Schema de validare pentru transfer interbancar național
const domesticBankTransferSchema = z.object({
  sourceAccountId: z.string().min(1, "Contul sursă este obligatoriu"),
  destinationIban: z.string()
    .min(10, "IBAN-ul destinație este prea scurt")
    .max(34, "IBAN-ul destinație este prea lung")
    .regex(/^[A-Z0-9]+$/, "IBAN-ul poate conține doar litere mari și cifre"),
  beneficiaryName: z.string().min(2, "Numele beneficiarului este obligatoriu"),
  beneficiaryBankName: z.string().min(3, "Numele băncii beneficiare este obligatoriu"),
  // Poți adăuga BIC/SWIFT dacă e relevant pentru transferuri domestice în Moldova, sau cod fiscal
  // beneficiaryFiscalCode: z.string().optional(), 
  amount: z.number().positive("Suma trebuie să fie un număr pozitiv"),
  description: z.string().min(1, "Descrierea este obligatorie pentru acest tip de transfer"), // Adesea obligatorie
});

type DomesticBankTransferFormValues = z.infer<typeof domesticBankTransferSchema>;

const TransferDomesticBankForm = ({ onCloseModal }: TransferDomesticBankFormProps) => {
  const { success: notifySuccess, error: notifyError } = useNotification();
  const { data: userAccounts, isLoading: isLoadingAccounts } = useGetUserDbAccountsQuery();
  // const [makeTransfer, { isLoading: isTransferring }] = useMakeDomesticBankTransferMutation();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm<DomesticBankTransferFormValues>({
    resolver: zodResolver(domesticBankTransferSchema),
    defaultValues: {
        amount: 0,
    }
  });

  const sourceAccountId = watch('sourceAccountId');
  const selectedSourceAccount = userAccounts?.find(acc => acc.id.toString() === sourceAccountId);

  const onSubmit: SubmitHandler<DomesticBankTransferFormValues> = async (data) => {
    console.log("Date formular pentru transfer interbancar național:", data);
    try {
    //   await makeTransfer({
    //     fromAccountId: parseInt(data.sourceAccountId),
    //     toIban: data.destinationIban,
    //     beneficiaryName: data.beneficiaryName,
    //     beneficiaryBankName: data.beneficiaryBankName,
    //     amount: data.amount,
    //     description: data.description,
    //     currency: selectedSourceAccount?.currency || 'LEI' // De obicei LEI pentru domestic
    //   }).unwrap();
      notifySuccess('Transferul interbancar național a fost inițiat cu succes!');
      reset();
      onCloseModal();
    } catch (err) {
      console.error("Eroare la transferul interbancar național:", err);
      const errorMessage = (err as any)?.data?.message || "A apărut o eroare la inițierea transferului.";
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
        <label htmlFor="sourceAccountIdDomestic">Din Contul:</label>
        <select id="sourceAccountIdDomestic" {...register("sourceAccountId")} disabled={isSubmitting}>
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
        <label htmlFor="destinationIbanDomestic">IBAN Destinatar (Altă Bancă):</label>
        <input
          type="text"
          id="destinationIbanDomestic"
          placeholder="IBAN beneficiar"
          {...register("destinationIban")}
          disabled={isSubmitting}
        />
        {errors.destinationIban && <span className="error-message">{errors.destinationIban.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="beneficiaryNameDomestic">Nume Beneficiar:</label>
        <input
          type="text"
          id="beneficiaryNameDomestic"
          placeholder="Numele complet al beneficiarului"
          {...register("beneficiaryName")}
          disabled={isSubmitting}
        />
        {errors.beneficiaryName && <span className="error-message">{errors.beneficiaryName.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="beneficiaryBankNameDomestic">Numele Băncii Beneficiare:</label>
        <input
          type="text"
          id="beneficiaryBankNameDomestic"
          placeholder="Ex: Moldova Agroindbank, Victoriabank"
          {...register("beneficiaryBankName")}
          disabled={isSubmitting}
        />
        {errors.beneficiaryBankName && <span className="error-message">{errors.beneficiaryBankName.message}</span>}
      </div>
      
      <div className="form-field">
        <label htmlFor="amountDomestic">Sumă{selectedSourceAccount ? ` (${selectedSourceAccount.currency})` : ' (LEI)'}:</label>
        <input 
          type="number" 
          id="amountDomestic" 
          step="0.01" 
          placeholder="0.00"
          {...register("amount", { valueAsNumber: true })}
          disabled={isSubmitting}
        />
        {errors.amount && <span className="error-message">{errors.amount.message}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="descriptionDomestic">Descrierea Plății / Detalii:</label>
        <textarea 
          id="descriptionDomestic" 
          rows={3}
          placeholder="Ex: Plata factură energie electrică Nr. 123"
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
          {isSubmitting /* || isTransferring */ ? 'Se inițiază...' : 'Inițiază Transferul'}
        </button>
      </div>
    </form>
  );
};

export default TransferDomesticBankForm;