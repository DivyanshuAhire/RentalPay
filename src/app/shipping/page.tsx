import { LegalPage } from "@/components/LegalPage";
import { LEGAL_DOCS } from "@/constants/legal";

export default function ShippingPage() {
  return <LegalPage title="Shipping & Delivery Policy" content={LEGAL_DOCS.shipping} />;
}
