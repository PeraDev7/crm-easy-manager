
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type: "quote" | "invoice" | "payment";
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const getStatusColor = (status: string, type: "quote" | "invoice" | "payment") => {
    const colors = {
      quote: {
        draft: "bg-gray-100 text-gray-800",
        sent: "bg-blue-100 text-blue-800",
        accepted: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
      },
      invoice: {
        draft: "bg-gray-100 text-gray-800",
        sent: "bg-blue-100 text-blue-800",
        paid: "bg-green-100 text-green-800",
        overdue: "bg-red-100 text-red-800",
      },
      payment: {
        pending: "bg-yellow-100 text-yellow-800",
        partial: "bg-orange-100 text-orange-800",
        completed: "bg-green-100 text-green-800",
      },
    };

    return colors[type][status as keyof typeof colors[typeof type]] || "bg-gray-100 text-gray-800";
  };

  return (
    <span
      className={cn(
        "px-2 py-1 rounded-full text-xs font-medium",
        getStatusColor(status, type)
      )}
    >
      {status}
    </span>
  );
}
