import { LegalPage } from "@/components/LegalPage";
import { LEGAL_DOCS } from "@/constants/legal";

export default function RefundPage() {
  return <LegalPage title="Refund & Cancellation Policy" content={LEGAL_DOCS.refund} />;
}
