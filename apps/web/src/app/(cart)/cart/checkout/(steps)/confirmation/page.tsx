import ConfirmationForm from "@/components/checkout/forms/ConfirmationForm";
import StepPanel from "@/components/checkout/StepPanel";

export default function CheckoutStepPage() {
  return (
    <StepPanel title="4. Підтвердження">
      <ConfirmationForm />
    </StepPanel>
  );
}
