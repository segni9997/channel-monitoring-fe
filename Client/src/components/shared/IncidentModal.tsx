import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useGetReasonsQuery } from "@/api/reasonApi";
import { useGetBranchesQuery } from "@/api/branchApi";
import { useGetAtmsQuery } from "@/api/atmApi";
import { useGetChannelsQuery } from "@/api/channelApi";
import { 
  useCreateIncidentMutation, 
  useCreateAtmIncidentMutation, 
  useUpdateIncidentMutation 
} from "@/api/incedentApi";
import { useGetShiftInfoQuery } from "@/api/settingsApi";
import { useAuthStore } from "@/store/authStore";
import { Channel, Status } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface AddIncidentModalProps {
  onClose: () => void;
}

export const AddIncidentModal = ({ onClose }: AddIncidentModalProps) => {
  const { user } = useAuthStore();
  const { data: branchesData } = useGetBranchesQuery();
  const branches = Array.isArray(branchesData) ? branchesData : branchesData?.branches || [];
  const { data: channelsData } = useGetChannelsQuery();
  const channels = Array.isArray(channelsData) ? channelsData : channelsData?.channels || [];
  const { data: shiftInfo } = useGetShiftInfoQuery();

  const [createIncident, { isLoading: isCreatingNormal }] = useCreateIncidentMutation();
  const [createAtmIncident, { isLoading: isCreatingAtm }] = useCreateAtmIncidentMutation();

  const [downtimeStart, setDowntimeStart] = useState<string>(new Date().toISOString());
  const [downtimeEnd, setDowntimeEnd] = useState<string>("");
  const [channel, setChannel] = useState<Channel>(Channel.ATM);
  const [reasonId, setReasonId] = useState("");
  const [remark, setRemark] = useState("");

  // ATM specific states
  const [branchId, setBranchId] = useState("");
  const [atmIds, setAtmIds] = useState<string[]>([]);

  // Notifications
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isSaving = isCreatingNormal || isCreatingAtm;

  // Derive the numeric channel ID from the selected channel name to filter reasons
  const selectedChannelId = channels.find((c: any) => c.name === channel)?.id;

  const { data: reasonsData } = useGetReasonsQuery(
    { channel_id: selectedChannelId ? String(selectedChannelId) : undefined },
    { skip: !selectedChannelId }
  );
  const reasons = Array.isArray(reasonsData) ? reasonsData : reasonsData?.reasons || [];

  const { data: atmsData } = useGetAtmsQuery({ branch_id: branchId }, { skip: !branchId });
  const branchATMs = Array.isArray(atmsData) ? atmsData : atmsData?.atms || [];

  // Detect if ATM channel is selected (by name, since channels are dynamic)
  const isAtmChannel = channel.toUpperCase() === "ATM";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downtimeStart || !reasonId || !user) return;

    setErrorMsg("");
    setSuccessMsg("");

    // Format date to API expected format: "yyyy-MM-dd HH:mm:ss"
    const formatDate = (iso: string) => format(new Date(iso), "yyyy-MM-dd HH:mm:ss");

    try {
      if (isAtmChannel) {
        await createAtmIncident({
          createdBy: Number(user.id),
          downTimeStart: formatDate(downtimeStart),
          downTimeEnd: downtimeEnd ? formatDate(downtimeEnd) : undefined,
          channel,
          reasonId: Number(reasonId),
          branch_id: Number(branchId),
          atm_id: atmIds.length > 0 ? Number(atmIds[0]) : undefined,
          remark,
          status: "inprogress",
        } as any).unwrap();
      } else {
        await createIncident({
          createdBy: Number(user.id),
          downTimeStart: formatDate(downtimeStart),
          downTimeEnd: downtimeEnd ? formatDate(downtimeEnd) : undefined,
          channel,
          reasonId: Number(reasonId),
          remark,
          status: "inprogress",
        } as any).unwrap();
      }
      setSuccessMsg("Incident created successfully!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Failed to create incident", error);
      setErrorMsg(error?.data?.message || "Failed to create incident. Please check details and try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Report New Incident</CardTitle>
            <CardDescription>Log a new downtime event. Leaving end time empty creates a PENDING incident.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isShiftActive && (
              <div className="flex items-start gap-2.5 text-sm text-amber-800 bg-amber-50 p-3 rounded-md border border-amber-200">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-semibold">Shift Inactive:</span> Incidents can only be created during the active shift window. Current shift starts at <span className="font-mono">{shiftInfo?.shift_start_time || '00:00:00'}</span> and lasts for {shiftInfo?.shift_duration || 24} hours.
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-md border border-destructive/20 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2.5 rounded-md border border-green-200 animate-in fade-in duration-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date & Time *</label>
                <DateTimePicker date={downtimeStart} onChange={setDowntimeStart} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date & Time (Optional)</label>
                <DateTimePicker 
                  date={downtimeEnd} 
                  onChange={setDowntimeEnd} 
                  placeholder="Ongoing..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Channel *</label>
              <Select
                value={channel}
                onChange={(e) => {
                  setChannel(e.target.value as Channel);
                  setReasonId("");
                }}
                options={channels.length > 0 
                  ? channels.map((c: any) => ({ value: c.name, label: c.name.replace("_", " ") }))
                  : Object.values(Channel).map(c => ({ value: c, label: c.replace("_", " ") }))
                }
              />
            </div>

            {isAtmChannel && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch *</label>
                  <Select 
                    value={branchId}
                    onChange={(e) => {
                      setBranchId(e.target.value);
                      setAtmIds([]); // Reset selected ATMs when branch changes
                    }}
                    options={branches.map(b => ({ value: b.id, label: b.name }))}
                    placeholder="Select Branch"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ATMs *</label>
                  <MultiSelect 
                    selected={atmIds}
                    onChange={setAtmIds}
                    options={branchATMs.map(a => ({ value: a.id, label: a.name }))}
                    placeholder={branchId ? "Select ATMs..." : "Select Branch First"}
                    className={!branchId ? "opacity-50 pointer-events-none" : ""}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason *</label>
              <Select
                value={reasonId}
                onChange={(e) => setReasonId(e.target.value)}
                options={[{ value: "", label: "-- Select Reason --" }, ...reasons.map((r: any) => ({ value: String(r.id), label: r.name }))]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Remark</label>
              <Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Provide any additional details..." />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t p-4 mt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving || !reasonId || (isAtmChannel && (!branchId || atmIds.length === 0))}>
              {isSaving ? "Saving..." : "Save Incident"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export const ResolveIncidentModal = ({ incidentId, onClose }: { incidentId: string, onClose: () => void }) => {
  const [downtimeEnd, setDowntimeEnd] = useState<string>(new Date().toISOString());
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [updateIncident, { isLoading: isUpdating }] = useUpdateIncidentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downtimeEnd) return;

    setErrorMsg("");
    setSuccessMsg("");

    const formatDate = (iso: string) => format(new Date(iso), "yyyy-MM-dd HH:mm:ss");

    try {
      await updateIncident({
        id: incidentId,
        body: {
          downTimeEnd: formatDate(downtimeEnd),
          status: Status.COMPLETED,
        }
      }).unwrap();
      setSuccessMsg("Incident resolved successfully!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Failed to resolve incident", error);
      setErrorMsg(error?.data?.message || "Failed to resolve incident. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Resolve Incident</CardTitle>
            <CardDescription>Specify the end time to calculate duration and mark as completed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-md border border-destructive/20 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2.5 rounded-md border border-green-200 animate-in fade-in duration-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date & Time</label>
              <DateTimePicker date={downtimeEnd} onChange={setDowntimeEnd} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t p-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isUpdating}>Cancel</Button>
            <Button type="submit" variant="default" className="bg-green-600 hover:bg-green-700" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Complete Incident"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
