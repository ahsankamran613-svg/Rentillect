import { MessageSquare } from "lucide-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

export default function TenantChatPage() {
  return (
    <FeaturePlaceholder
      title="Landlord Communication & Maintenance Requests"
      phase="Phase 5 Milestone"
      description="Directly chat with your landlord. Submit formal maintenance and repair requests with photo attachments to ensure timely resolution according to statutory tenancy duties."
      icon={MessageSquare}
      features={[
        "Photo & Video Maintenance Requests",
        "Official Tenancy Notices",
        "Direct Messaging Channel",
        "Emergency Contact Sync"
      ]}
      backLink="/tenant"
      backText="Tenant Overview"
    />
  );
}
