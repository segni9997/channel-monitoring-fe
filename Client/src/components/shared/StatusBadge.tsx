import { Badge } from "@/components/ui/badge";

export const StatusBadge = ({ status, duration }: { status: string; duration?: number }) => {
  const normalized = status?.toLowerCase();

  if (normalized === "inprogress" || normalized === "pending" || normalized === "in_progress") {
    if (duration !== undefined && duration > 60) {
      return <Badge variant="destructive">Critical (over 60 mins)</Badge>;
    }
    return <Badge variant="warning">In Progress</Badge>;
  }

  if (normalized === "completed") {
    return <Badge variant="success">Completed</Badge>;
  }

  return <Badge variant="outline">{status}</Badge>;
};
