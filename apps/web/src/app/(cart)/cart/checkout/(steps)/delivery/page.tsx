import DeliveryForm from "@/components/checkout/forms/DeliveryForm";
import StepPanel from "@/components/checkout/StepPanel";

export default function CheckoutStepPage() {
  return (
    <StepPanel title="2. Спосіб доставки">
      <DeliveryForm />
    </StepPanel>
  );
}
