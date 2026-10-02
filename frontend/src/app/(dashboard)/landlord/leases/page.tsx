import { FileText } from "lucide-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

export default function LandlordLeasesPage() {
  return (
    <FeaturePlaceholder
      title="Digital Leases & Legal Compliance"
      phase="Phase 3 Milestone"
      description="Draft and issue standard Pakistani tenancy agreements. Our Gemini AI assistant scans every clause against provincial tenancy legislation including Punjab 2009, Sindh 1979, and Islamabad ICT 2001."
      icon={FileText}
      features={[
        "Provincial Act Compliance Scanner",
        "Digital e-Signatures with OTP",
        "Automated Stamp Paper Format",
        "Notice of Eviction & Renewal Alerts"
      ]}
      backLink="/landlord"
      backText="Landlord Overview"
    />
  );
}
