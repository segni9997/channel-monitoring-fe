import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Status } from "@/types";
import {

  Tooltip as RechartsTooltip,
  ResponsiveContainer,

  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line
} from "recharts";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";


import { useDashboardStore } from "@/store/dashboardStore";
import { useDashboardQuery } from "@/api/dashbaordApi";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard = () => {
  const { fromDate, toDate, setFromDate, setToDate } = useDashboardStore();

const { data } = useDashboardQuery(
  { fromDate, toDate },
  { 
    refetchOnMountOrArgChange: true,
    pollingInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  }
);

  console.log("dashboard data", fromDate, toDate , data)
 

   const totalIncidents = data?.total_incidents ?? 0;
  const pendingIncidents = data?.pending_incidents ?? 0;
  const completedIncidents = data?.completed_incidents ?? 0;
  const totalDowntime = data?.total_down_time ?? 0;
  
  const downtimeData = useMemo(() => {
    if (!data?.downtime_per_channel) return [];
    return Object.entries(data.downtime_per_channel).map(([key, val]) => ({
      name: key,
      value: val.total_downtime,
    }));
  }, [data?.downtime_per_channel]);
  const chartData = Object.entries(data?.incident_trends || {}).map(
  ([date, count]) => ({
    date,
    count,
  })
);


  return (
    <div className="space-y-6 ">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor incident analytics and performance.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto mt-4 sm:mt-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap w-10 sm:w-auto">From:</span>
            <div className="flex-1 sm:w-[180px]">
              <DatePicker date={fromDate} onChange={(d) => setFromDate(d)} />
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap w-10 sm:w-auto">To:</span>
            <div className="flex-1 sm:w-[180px]">
              <DatePicker date={toDate} onChange={(d) => setToDate(d)} />
            </div>
          </div>
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
            {downtimeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                
                <RechartsTooltip
                  contentStyle={{ borderRadius: "8px" }}
                />

                <Pie
                  data={downtimeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="hsl(var(--accent))"
                  label
                >
                  {downtimeData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
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
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
