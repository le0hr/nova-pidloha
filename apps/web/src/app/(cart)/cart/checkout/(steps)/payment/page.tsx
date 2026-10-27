import PaymentForm from "@/components/checkout/forms/PaymentForm";
import StepPanel from "@/components/checkout/StepPanel";

export default function CheckoutStepPage() {
  return (
    <StepPanel title="3. Спосіб оплати">
      <PaymentForm />
    </StepPanel>
  );
}
