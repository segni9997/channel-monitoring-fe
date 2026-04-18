import { Badge } from "@/components/ui/badge";
import { Status } from "@/types";

export const StatusBadge = ({ status, duration }: { status: Status; duration?: number }) => {
  if (status === Status.PENDING) {
    if (duration !== undefined && duration > 60) {
      return <Badge variant="destructive">Critical (over 60 mins)</Badge>;
    }
    return <Badge variant="warning">Pending</Badge>;
  }

  return <Badge variant="success">Completed</Badge>;
};
