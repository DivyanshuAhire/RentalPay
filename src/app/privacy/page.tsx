import { LegalPage } from "@/components/LegalPage";
import { LEGAL_DOCS } from "@/constants/legal";

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" content={LEGAL_DOCS.privacy} />;
}
