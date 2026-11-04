import { getShopLocations } from "@/lib/services/shop.service";
import DeliveryForm from "@/components/checkout/forms/DeliveryForm";
import StepPanel from "@/components/checkout/StepPanel";

export default async function CheckoutStepPage() {
  const shops = await getShopLocations();
  return (
    <StepPanel title="2. Спосіб доставки">
      <DeliveryForm shops={shops} />
    </StepPanel>
  );
}
