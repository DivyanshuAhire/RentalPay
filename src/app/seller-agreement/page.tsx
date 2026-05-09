import { LegalPage } from "@/components/LegalPage";
import { LEGAL_DOCS } from "@/constants/legal";

export default function SellerAgreementPage() {
  return <LegalPage title="Seller Agreement" content={LEGAL_DOCS["seller-agreement"]} />;
}
