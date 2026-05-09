import { LegalPage } from "@/components/LegalPage";
import { LEGAL_DOCS } from "@/constants/legal";

export default function CommunityPage() {
  return <LegalPage title="Community Guidelines" content={LEGAL_DOCS.community} />;
}
