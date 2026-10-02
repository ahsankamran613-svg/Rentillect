import { MessageSquare } from "lucide-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

export default function LandlordChatPage() {
  return (
    <FeaturePlaceholder
      title="In-App Messaging & Maintenance"
      phase="Phase 5 Milestone"
      description="Communicate securely with your tenants and prospective applicants. Keep an immutable record of all maintenance requests, repair estimates, and tenancy notices."
      icon={MessageSquare}
      features={[
        "Real-Time Chat & Media Sharing",
        "Maintenance Ticket Tracking",
        "Official Tenancy Notice Records",
        "Direct WhatsApp Sync"
      ]}
      backLink="/landlord"
      backText="Landlord Overview"
    />
  );
}
