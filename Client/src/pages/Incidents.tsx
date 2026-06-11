import { useState, useMemo, useEffect } from "react";
import { useGetReasonsQuery } from "@/api/reasonApi";
import { useGetChannelsQuery } from "@/api/channelApi";
import { useGetDepartmentsQuery } from "@/api/departmentApi";
import { useAuthStore } from "@/store/authStore";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { MultiSelect } from "@/components/ui/multi-select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AddIncidentModal, ResolveIncidentModal } from "@/components/shared/IncidentModal";
import { Pagination } from "@/components/ui/pagination";
import { downloadCSV } from "@/utils/csv";
import { getBusinessDate } from "@/utils/date";
import { Role, Status, Channel } from "@/types";
import { Plus, Download, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetIncidentsQuery } from "@/api/incedentApi";
import { useGetShiftInfoQuery } from "@/api/settingsApi";

// Live elapsed-time counter for in-progress incidents
const LiveDuration = ({ startTime }: { startTime: string }) => {
  const calcElapsed = () => {
    const diffMs = Date.now() - new Date(startTime).getTime();
    if (diffMs <= 0) return "0s";
    const totalSecs = Math.floor(diffMs / 1000);
    const d = Math.floor(totalSecs / 86400);
    const h = Math.floor((totalSecs % 86400) / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    const parts: string[] = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(" ");
  };

  const [elapsed, setElapsed] = useState(calcElapsed);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(calcElapsed()), 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <span className="font-mono text-xs text-destructive font-semibold animate-pulse">
      ⏱ {elapsed}
    </span>
  );
};

export const Incidents = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const { data: reasonsData } = useGetReasonsQuery({});
  const reasons = Array.isArray(reasonsData) ? reasonsData : reasonsData?.reasons || [];
  const { data: channelsData } = useGetChannelsQuery();
  const dynamicChannels = Array.isArray(channelsData) ? channelsData : channelsData?.channels || [];
  const { data: deptsData } = useGetDepartmentsQuery();
  const departments = Array.isArray(deptsData) ? deptsData : deptsData?.departments || [];
  const { user } = useAuthStore();
    const { data: shiftInfo } = useGetShiftInfoQuery();
  
  // Date filtering states (defaulting to today's date)
  const today = format(new Date(), "yyyy-MM-dd");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [selectedReasonIds, setSelectedReasonIds] = useState<string[]>([]);
  const { data } = useGetIncidentsQuery({
    from_date: fromDate,
    to_date: toDate ? `${toDate} 23:59:59` : undefined,
    status: statusFilter !== "ALL" ? statusFilter.toLowerCase() : undefined,
    channel: channelFilter !== "ALL" ? channelFilter : undefined,
    reason_id: selectedReasonIds.length > 0 ? selectedReasonIds[0] : undefined,
  });

  const isShiftActive = useMemo(() => {
    const duration = Number(shiftInfo?.shift_duration || 24);
    const startTimeStr = shiftInfo?.shift_start_time;
    if (duration >= 24 || !startTimeStr) return true;

    const now = new Date();
    const [sh, sm, ss] = startTimeStr.split(":").map(Number);
    
    // Today's shift window
    const todayStart = new Date(now);
    todayStart.setHours(sh, sm || 0, ss || 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(todayEnd.getHours() + duration);
    
    // Yesterday's shift window
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setHours(yesterdayEnd.getHours() + duration);
    
    return (now >= todayStart && now <= todayEnd) || (now >= yesterdayStart && now <= yesterdayEnd);
  }, [shiftInfo]);

  console.log("Shift Active:", isShiftActive, "Shift Start:", shiftInfo?.shift_start_time, "Shift Duration:", shiftInfo?.shift_duration, "channels data", dynamicChannels, "depts", deptsData );
  const apiIncidents: any[] = data?.incidents || [];

  // Modal states
  const [isAdding, setIsAdding] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const isPrivileged = user?.role === Role.super_admin || user?.role === Role.admin || user?.role === Role.pms_offcier;

  const formatDuration = (raw: string | number | undefined): string => {
    if (raw === undefined || raw === null || raw === "") return "00:00:00";

    let totalMinutes = 0;

    if (typeof raw === "number") {
      totalMinutes = raw;
    } else {
      const str = raw.trim();
      if (/^\d+:\d{2}:\d{2}$/.test(str)) {
        const [hh, mm, ss] = str.split(":").map(Number);
        totalMinutes = hh * 60 + mm + ss / 60;
      } else {
        const match = str.match(/^[\d.]+/);
        totalMinutes = match ? parseFloat(match[0]) : 0;
      }
    }

    if (totalMinutes <= 0) return "00:00:00";

    const totalSecs = Math.round(totalMinutes * 60);
    const d = Math.floor(totalSecs / 86400);
    const h = Math.floor((totalSecs % 86400) / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    const parts: string[] = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(" ");
  };

  
  const pagedIncidents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return apiIncidents.slice(start, start + pageSize);
  }, [apiIncidents, page, pageSize]);

  const handleExport = () => {
    const exportData = apiIncidents.map((inc) => {
      const deptName = departments.find((d: any) => String(d.id) === String(inc.reason?.responsible_dept))?.name
        || inc.reason?.responsible_dept
        || "--";

      const data = {
        "Business Date": getBusinessDate(inc.downTimeStart),
        "Channel": inc.channel.replace("_", " "),
        "Branch": inc.branch?.name || inc.branch_id || "--",
        "ATM": inc.channel === Channel.ATM ? (inc.atm?.name || inc.atm_id || "--") : "N/A",
        "Downtime Start": format(new Date(inc.downTimeStart), "yyyy-MM-dd HH:mm:ss"),
        "Downtime End": inc.downTimeEnd ? format(new Date(inc.downTimeEnd), "yyyy-MM-dd HH:mm:ss") : "ONGOING",
        "Duration": inc.status?.toLowerCase() === "inprogress" || inc.status?.toLowerCase() === "pending" ? "ONGOING" : formatDuration(inc.duration),
        "Status": inc.status,
        "Reason": inc.reason?.name || inc.reasonId || "--",
        "Remark": inc.remark || "--",
        ...(isPrivileged ? { "Responsible Department": deptName } : {}),
      };

      return data;
    });
    downloadCSV(exportData, `Incidents_Report_${format(new Date(), "yyyyMMdd_HHmm")}`);
  };

  const canEdit =  user?.role === Role.super_admin || user?.role === Role.admin || user?.role === Role.epayment_officer;

  return (
    <div className="space-y-6">
      {isAdding && <AddIncidentModal onClose={() => setIsAdding(false)} />}
      {resolvingId && <ResolveIncidentModal incidentId={resolvingId} onClose={() => setResolvingId(null)} />}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">Incidents Register</h1>
            {shiftInfo?.shift_start_time && (
              <Badge 
                variant={isShiftActive ? "default" : "secondary"}
                className={isShiftActive 
                  ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-100" 
                  : "bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-100"
                }
              >
                {isShiftActive ? "● Shift Active" : "○ Shift Inactive (Outside Hours)"}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">Manage and track service downtime events.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {canEdit && (
            <Button variant="default" onClick={() => setIsAdding(true)} className="flex-1 sm:flex-none">
              <Plus className="mr-2 h-4 w-4" /> Add Incident
            </Button>
          )}
          <Button variant="outline" onClick={handleExport} className="flex-1 sm:flex-none">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="py-4 border-b">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtered List
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-8 w-8 text-muted-foreground"
                  onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                >
                  {isFiltersVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
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

            <div className={cn(
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4",
              !isFiltersVisible && "hidden lg:grid"
            )}>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">From Date</label>
                <DatePicker 
                  date={fromDate} 
                  onChange={(d) => { 
                    setFromDate(d); 
                    if (new Date(d) > new Date(toDate)) {
                      setToDate(d);
                    }
                    setPage(1); 
                  }} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">To Date</label>
                <DatePicker 
                  date={toDate} 
                  onChange={(d) => { 
                    if (new Date(d) < new Date(fromDate)) {
                      setToDate(fromDate);
                    } else {
                      setToDate(d);
                    }
                    setPage(1); 
                  }} 
                />
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
                    ...(dynamicChannels.length > 0
                      ? dynamicChannels.map((c: any) => ({ value: c.name, label: c.name.replace("_", " ") }))
                      : Object.values(Channel).map(c => ({ value: c, label: c.replace("_", " ") })))
                  ]}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Reasons</label>
                <MultiSelect
                  selected={selectedReasonIds}
                  onChange={(ids) => { setSelectedReasonIds(ids); setPage(1); }}
                  options={reasons?.map((r: any) => ({ value: r.id, label: r.name })) ?? []}
                  placeholder="Filter Reasons..."
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Business Date</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Location (Branch/ATMs)</TableHead>
                  <TableHead>Downtime Window</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  {isPrivileged && <TableHead>Responsible Dept</TableHead>}
                  {canEdit && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedIncidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isPrivileged ? 9 : 8} className="text-center h-24 text-muted-foreground">
                      No incidents found for selected criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedIncidents.map((inc) => (
                    <TableRow key={inc.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {getBusinessDate(inc.downTimeStart)}
                      </TableCell>
                      <TableCell>{inc.channel.replace("_", " ")}</TableCell>
                      <TableCell>
                        {inc.channel === Channel.ATM ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium">{inc.branch?.name || inc.branch_id || "--"}</span>
                            <span className="text-[10px] text-muted-foreground line-clamp-1" title={inc.atm?.name || inc.atm_id || "--"}>
                              {inc.atm?.name || inc.atm_id || "--"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {format(new Date(inc.downTimeStart), "MMM dd, HH:mm")} <br />
                        {inc.downTimeEnd ? format(new Date(inc.downTimeEnd), "MMM dd, HH:mm") : <span className="text-destructive font-semibold">ONGOING</span>}
                      </TableCell>
                      <TableCell>
                        {inc.status?.toLowerCase() === "inprogress" || inc.status?.toLowerCase() === "pending"
                          ? <LiveDuration
                           startTime={inc.downTimeStart} />
                          : formatDuration(inc.duration)
                        }
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={inc.status} duration={parseInt(inc.duration) || undefined} />
                      </TableCell>
                      <TableCell className="max-w-[200px]" title={inc.remark}>
                        <span className="font-medium text-foreground block truncate">{inc.reason?.name || inc.reasonId || "--"}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">{inc.remark}</span>
                      </TableCell>
                      {isPrivileged && (
                        <TableCell>
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/5 text-primary">
                            {departments.find((d: any) => String(d.id) === String(inc.reason?.responsible_dept))?.name
                              || inc.reason?.responsible_dept
                              || "--"}
                          </span>
                        </TableCell>
                      )}
                      {canEdit && (
                        <TableCell className="text-right">
                          {inc.status?.toLowerCase() === "inprogress" || inc.status?.toLowerCase() === "pending" ? (
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
          </div>
          <Pagination
            currentPage={page}
            totalCount={apiIncidents.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
};
