import { useState, useMemo } from "react";
import { useIncidentStore } from "@/store/incidentStore";
import { useReasonStore } from "@/store/reasonStore";
import { useAuthStore } from "@/store/authStore";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { MultiSelect } from "@/components/ui/multi-select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AddIncidentModal, ResolveIncidentModal } from "@/components/shared/IncidentModal";
import { Pagination } from "@/components/ui/pagination";
import { downloadCSV } from "@/utils/csv";
import { getBusinessDate } from "@/utils/date";
import { Role, Status, Channel } from "@/types";
import { Plus, Download, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Incidents = () => {
  const { incidents, page, pageSize, setPage, setPageSize } = useIncidentStore();
  const { reasons } = useReasonStore();
  const { user } = useAuthStore();
  
  // Date filtering states (defaulting to today's date)
  const today = format(new Date(), "yyyy-MM-dd");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  // New filtering states
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [selectedReasonIds, setSelectedReasonIds] = useState<string[]>([]);

  // Modal states
  const [isAdding, setIsAdding] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const getReasonLabel = (reasonId: string) => {
    return reasons.find(r => r.id === reasonId)?.description || reasonId;
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Date Filter
      if (fromDate && toDate) {
        const incDate = new Date(inc.downtimeStart);
        const startObj = startOfDay(new Date(fromDate));
        const endObj = endOfDay(new Date(toDate));
        if (!isWithinInterval(incDate, { start: startObj, end: endObj })) return false;
      }

      // Status Filter
      if (statusFilter !== "ALL" && inc.status !== statusFilter) return false;

      // Channel Filter
      if (channelFilter !== "ALL" && inc.channel !== channelFilter) return false;

      // Multi-Reason Filter
      if (selectedReasonIds.length > 0 && !selectedReasonIds.includes(inc.reasonId)) return false;

      return true;
    });
  }, [incidents, fromDate, toDate, statusFilter, channelFilter, selectedReasonIds]);

  // Paged Data
  const pagedIncidents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredIncidents.slice(start, start + pageSize);
  }, [filteredIncidents, page, pageSize]);

  const handleExport = () => {
    const exportData = filteredIncidents.map((inc) => ({
      ID: inc.id,
      "Business Date": getBusinessDate(inc.downtimeStart),
      "Start Time": format(new Date(inc.downtimeStart), "yyyy-MM-dd HH:mm"),
      "End Time": inc.downtimeEnd ? format(new Date(inc.downtimeEnd), "yyyy-MM-dd HH:mm") : "PENDING",
      Duration: inc.duration ?? "N/A",
      Channel: inc.channel,
      Status: inc.status,
      Reason: getReasonLabel(inc.reasonId),
      Remark: inc.remark,
    }));
    downloadCSV(exportData, "Incidents_Export");
  };

  const canEdit =  user?.role === Role.super_admin || user?.role === Role.admin || user?.role === Role.epayment_officer;

  return (
    <div className="space-y-6">
      {isAdding && <AddIncidentModal onClose={() => setIsAdding(false)} />}
      {resolvingId && <ResolveIncidentModal incidentId={resolvingId} onClose={() => setResolvingId(null)} />}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidents Register</h1>
          <p className="text-muted-foreground mt-1">Manage and track service downtime events.</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button variant="default" onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Incident
            </Button>
          )}
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="py-4 border-b">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtered List
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setFromDate(today);
                    setToDate(today);
                    setStatusFilter("ALL");
                    setChannelFilter("ALL");
                    setSelectedReasonIds([]);
                    setPage(1);
                  }}
                  className="text-xs h-8"
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">From Date</label>
                <DatePicker date={fromDate} onChange={(d) => { setFromDate(d); setPage(1); }} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">To Date</label>
                <DatePicker date={toDate} onChange={(d) => { setToDate(d); setPage(1); }} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  options={[
                    { value: "ALL", label: "All Statuses" },
                    { value: Status.PENDING, label: "Pending" },
                    { value: Status.COMPLETED, label: "Completed" },
                  ]}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Channel</label>
                <Select
                  value={channelFilter}
                  onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }}
                  options={[
                    { value: "ALL", label: "All Channels" },
                    ...Object.values(Channel).map(c => ({ value: c, label: c.replace("_", " ") }))
                  ]}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Reasons</label>
                <MultiSelect
                  selected={selectedReasonIds}
                  onChange={(ids) => { setSelectedReasonIds(ids); setPage(1); }}
                  options={reasons.map(r => ({ value: r.id, label: r.description }))}
                  placeholder="Filter Reasons..."
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Business Date</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Downtime Window</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                {canEdit && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 7 : 6} className="text-center h-24 text-muted-foreground">
                    No incidents found for selected criteria.
                  </TableCell>
                </TableRow>
              ) : (
                pagedIncidents.map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell className="font-medium">
                      {getBusinessDate(inc.downtimeStart)}
                    </TableCell>
                    <TableCell>{inc.channel}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(new Date(inc.downtimeStart), "MMM dd, HH:mm")} <br />
                      {inc.downtimeEnd ? format(new Date(inc.downtimeEnd), "MMM dd, HH:mm") : <span className="text-destructive font-semibold">ONGOING</span>}
                    </TableCell>
                    <TableCell>
                      {inc.duration !== undefined ? `${inc.duration}m` : "--"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={inc.status} duration={inc.duration} />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={inc.remark}>
                      <span className="font-medium text-foreground block">{getReasonLabel(inc.reasonId)}</span>
                      <span className="text-xs text-muted-foreground">{inc.remark}</span>
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        {inc.status === Status.PENDING ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setResolvingId(inc.id)}
                            className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                          >
                            Resolve
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" disabled className="opacity-50">
                            Locked
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Pagination
            currentPage={page}
            totalCount={filteredIncidents.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
};
