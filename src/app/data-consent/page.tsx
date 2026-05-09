import { LegalPage } from "@/components/LegalPage";
import { LEGAL_DOCS } from "@/constants/legal";

export default function DataConsentPage() {
  return <LegalPage title="Consent for Data Processing & Cookies" content={LEGAL_DOCS["data-consent"]} />;
}
