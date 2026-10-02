import { Users } from "lucide-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

export default function TenantApplicationsPage() {
  return (
    <FeaturePlaceholder
      title="My Rental Applications"
      phase="Phase 5 Milestone"
      description="Track the real-time status of your rental applications across Pakistani residential properties. Receive instant notifications when a landlord approves your profile."
      icon={Users}
      features={[
        "Application Status Tracking",
        "CNIC Verified Renter Profile",
        "Direct Lease Offer Acceptance",
        "Document Upload Vault"
      ]}
      backLink="/tenant"
      backText="Tenant Overview"
    />
  );
}
