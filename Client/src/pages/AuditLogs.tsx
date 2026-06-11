import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Loader } from "@/components/shared/Loader";
import { ScrollText, RefreshCw, Search, X } from "lucide-react";
import { useGetAuditLogsQuery } from "@/api/auditApi";
import { format, parseISO } from "date-fns";

const PAGE_SIZE = 20;

const tryFormatDate = (val?: string) => {
  if (!val) return "—";
  try {
    return format(parseISO(val), "dd MMM yyyy, HH:mm:ss");
  } catch {
    return val;
  }
};

// Safely convert any value to a renderable string
const safeStr = (val: any): string => {
  if (val === null || val === undefined) return "—";
  if (typeof val === "string") return val || "—";
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    // Handle {message: "..."} or any object
    return val.message ?? val.details ?? val.text ?? JSON.stringify(val);
  }
  return String(val);
};

export const AuditLogs = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch, isFetching } = useGetAuditLogsQuery({ page });

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const lastPage = data?.last_page ?? 1;
  const perPage = data?.per_page ?? PAGE_SIZE;

  const filtered = search.trim()
    ? logs.filter((log) => {
        const q = search.toLowerCase();
        return (
          log.action?.toLowerCase().includes(q) ||
          log.details?.toLowerCase().includes(q) ||
          log.user_name?.toLowerCase().includes(q) ||
          String(log.user_id ?? "").includes(q)
        );
      })
    : logs;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSearch("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
          <p className="text-muted-foreground mt-1">
            System activity logs — paginated and searchable.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="audit_search_input"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 border-accent/20 focus-visible:ring-accent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <Button
            id="refresh_logs_btn"
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-accent" />
            Activity Logs
          </CardTitle>
          <CardDescription>
            {total > 0
              ? `Showing ${filtered.length} of ${total} total log entries (page ${page} of ${lastPage}).`
              : "All recorded system events."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader />
            </div>
          ) : isError ? (
            <div className="py-12 text-center text-destructive text-sm">
              Failed to load audit logs.{" "}
              <button onClick={() => refetch()} className="underline hover:opacity-70">
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No log entries found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">#</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((log, idx) => (
                      <TableRow key={log.id ?? idx} className="hover:bg-muted/40">
                        <TableCell className="text-muted-foreground font-mono text-xs">
                          {(page - 1) * perPage + idx + 1}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs border-accent/40 text-accent">
                            {safeStr(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm">
                          {safeStr(log.details)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {safeStr(log.user_name ?? log.user_id)}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {safeStr(log.ip_address)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {tryFormatDate(log.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                currentPage={page}
                totalCount={lastPage * perPage}
                pageSize={perPage}
                onPageChange={handlePageChange}
                onPageSizeChange={() => {}}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
