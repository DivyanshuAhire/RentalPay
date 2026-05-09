import { LegalPage } from "@/components/LegalPage";
import { TERMS_AND_CONDITIONS } from "@/constants/terms";

export default function TermsPage() {
  return <LegalPage title="Terms & Conditions" content={TERMS_AND_CONDITIONS} />;
}
