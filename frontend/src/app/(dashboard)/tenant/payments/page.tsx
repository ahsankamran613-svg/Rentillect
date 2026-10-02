import { CreditCard } from "lucide-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

export default function TenantPaymentsPage() {
  return (
    <FeaturePlaceholder
      title="Payments, Receipts & Security Deposit Ledger"
      phase="Phase 4 Milestone"
      description="View your complete Pakistani Rupee (PKR) rental payment ledger. Download official rent receipts for tax deductions and track your refundable security deposit balance."
      icon={CreditCard}
      features={[
        "Official PKR Rent Receipts",
        "Security Deposit Refund Tracker",
        "Utility Bills Split Calculator",
        "Due Date Reminders"
      ]}
      backLink="/tenant"
      backText="Tenant Overview"
    />
  );
}
