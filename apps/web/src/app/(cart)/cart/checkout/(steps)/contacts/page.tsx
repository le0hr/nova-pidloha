import ContactForm from "@/components/checkout/forms/ContactForm";
import StepPanel from "@/components/checkout/StepPanel";

export default function CheckoutStepPage() {
  return (
    <StepPanel title="1. Контактні дані">
      <ContactForm />
    </StepPanel>
  );
}
