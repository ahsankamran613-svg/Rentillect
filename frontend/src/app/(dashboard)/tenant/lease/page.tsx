import { FileText } from "lucide-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

export default function TenantLeasePage() {
  return (
    <FeaturePlaceholder
      title="My Rental Lease & Legal Protections"
      phase="Phase 3 Milestone"
      description="Access your digitally signed tenancy agreement anytime. All contracts are verified under local provincial rent acts protecting tenants against arbitrary rent spikes and unlawful evictions."
      icon={FileText}
      features={[
        "Legally Verified Digital Lease",
        "Rent Increase Statutory Caps",
        "Eviction Notice Period Rules",
        "Download Stamp Paper PDF"
      ]}
      backLink="/tenant"
      backText="Tenant Overview"
    />
  );
}
