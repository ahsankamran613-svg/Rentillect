import { CreditCard } from "lucide-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

export default function LandlordPaymentsPage() {
  return (
    <FeaturePlaceholder
      title="Rent Payments, Security Escrow & Ledger"
      phase="Phase 4 Milestone"
      description="Track monthly rent collection in Pakistani Rupees (PKR). Issue digital rent receipts, log utility dues, and manage 1-2 month security deposits with automated ledger reconciliation."
      icon={CreditCard}
      features={[
        "1-Click Pakistani Rupee Receipts",
        "Automated WhatsApp Rent Reminders",
        "Security Deposit Escrow Log",
        "Bank IBFT & 1Link Reconciliation"
      ]}
      backLink="/landlord"
      backText="Landlord Overview"
    />
  );
}
