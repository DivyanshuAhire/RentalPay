import { LegalPage } from "@/components/LegalPage";
import { LEGAL_DOCS } from "@/constants/legal";

export default function DMCAPage() {
  return <LegalPage title="DMCA / IP Complaint Policy" content={LEGAL_DOCS.dmca} />;
}
