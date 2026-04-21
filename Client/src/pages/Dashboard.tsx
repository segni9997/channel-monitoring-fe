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
import { useDashboardQuery } from "@/api/dashbaordApi";

export const Dashboard = () => {
  const { incidents } = useIncidentStore();
  const { timeRange, setTimeRange } = useDashboardStore();
 const mapFilter = (range: string) => {
    switch (range) {
      case "daily":
        return "24hrs";
      case "weekly":
        return "week";
      case "monthly":
        return "month";
      case "yearly":
        return "year";
      default:
        return "day";
    }
  };
const mapDateFilter = (range: string) => {
  const today = new Date();
  const format = (d: Date) => d.toISOString().split("T")[0];

  switch (range) {
    case "daily":
      return {
        from_date: format(new Date(today.setDate(today.getDate() - 1))),
      };
    case "weekly":
      return {
        from_date: format(new Date(today.setDate(today.getDate() - 7))),
      };
    case "monthly":
      return {
        from_date: format(new Date(today.setMonth(today.getMonth() - 1))),
      };
    case "yearly":
      return {
        from_date: format(new Date(today.setFullYear(today.getFullYear() - 1))),
      };
    default:
      return {};
  }
};
  const { data,} = useDashboardQuery({
    filter: mapFilter(timeRange),
  });
 

   const totalIncidents = data?.total_incidents ?? 0;
  const pendingIncidents = data?.pending_incidents ?? 0;
  const completedIncidents = data?.completed_incidents ?? 0;
  const totalDowntime = data?.total_down_time ?? 0;
  // Filter based on time range





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
              { value: "24hrs", label: "Last 24 Hours" },
              { value: "week", label: "Last 7 Days" },
              { value: "month", label: "Last 30 Days" },
              { value: "year", label: "Last Year" },
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
            {data?.total_down_time.length === 0 ? (
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
