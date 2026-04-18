import {  useMemo } from "react";
import { useIncidentStore } from "@/store/incidentStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Status } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Select } from "@/components/ui/select";
import { subDays, subMonths, subYears, isAfter } from "date-fns";
import { getBusinessDate } from "@/utils/date";

import { useDashboardStore } from "@/store/dashboardStore";

export const Dashboard = () => {
  const { incidents } = useIncidentStore();
  const { timeRange, setTimeRange } = useDashboardStore();

  // Filter based on time range
  const filteredIncidents = useMemo(() => {
    const now = new Date();
    let cutoffDate = subDays(now, 1);

    if (timeRange === "weekly") cutoffDate = subDays(now, 7);
    if (timeRange === "monthly") cutoffDate = subMonths(now, 1);
    if (timeRange === "yearly") cutoffDate = subYears(now, 1);

    if (timeRange === "all") return incidents;

    return incidents.filter(inc => isAfter(new Date(inc.downtimeStart), cutoffDate));
  }, [incidents, timeRange]);

  // Summary Metrics
  const totalIncidents = filteredIncidents.length;
  const totalDowntime = filteredIncidents.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const pendingIncidents = filteredIncidents.filter((i) => i.status === Status.PENDING).length;
  const completedIncidents = totalIncidents - pendingIncidents;

  // Bar Chart Data: Downtime per channel
  const downtimeByChannel = useMemo(() => {
    const map = new Map<string, number>();
    filteredIncidents.forEach((inc) => {
      const current = map.get(inc.channel) || 0;
      map.set(inc.channel, current + (inc.duration || 0));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredIncidents]);

  // Line Chart Data: Incident trend by Business Date
  const incidentsByDate = useMemo(() => {
    const map = new Map<string, number>();
    filteredIncidents.forEach((inc) => {
      const bDate = getBusinessDate(inc.downtimeStart);
      const current = map.get(bDate) || 0;
      map.set(bDate, current + 1);
    });
    return Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically
  }, [filteredIncidents]);

  return (
    <div className="space-y-6 ">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor incident analytics and performance.</p>
        </div>
        <div className="w-48">
          <Select
            options={[
              { value: "daily", label: "Last 24 Hours" },
              { value: "weekly", label: "Last 7 Days" },
              { value: "monthly", label: "Last 30 Days" },
              { value: "yearly", label: "Last Year" },
              { value: "all", label: "All Time" }
            ]}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4 border-accent shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">{totalIncidents}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-accent shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downtime</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">{totalDowntime} <span className="text-sm font-normal text-muted-foreground">mins</span></div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-accent shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-accent">{pendingIncidents}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-accent shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-green-600">{completedIncidents}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Downtime per Channel (mins)</CardTitle>
            <CardDescription>Aggregate duration metric.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {downtimeByChannel.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={downtimeByChannel} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Incident Trends</CardTitle>
            <CardDescription>Grouped by 7 AM rollover business date.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {incidentsByDate.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incidentsByDate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="Incidents" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 5, fill: 'hsl(var(--accent))' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
