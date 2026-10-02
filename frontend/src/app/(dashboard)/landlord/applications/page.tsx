import { Users } from "lucide-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

export default function LandlordApplicationsPage() {
  return (
    <FeaturePlaceholder
      title="Tenant Screening & Applications"
      phase="Phase 5 Milestone"
      description="Review prospective tenant applications with NADRA-aligned CNIC verification checks, employment proofs, family background, and previous landlord reference checks."
      icon={Users}
      features={[
        "CNIC Identity Verification",
        "Tenant Credit & Background History",
        "Single-Click Lease Conversion",
        "Application Status Tracking"
      ]}
      backLink="/landlord"
      backText="Landlord Overview"
    />
  );
}
