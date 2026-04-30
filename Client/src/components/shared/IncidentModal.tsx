import { useState } from "react";
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
import { useAuthStore } from "@/store/authStore";
import { Channel, Status } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

interface AddIncidentModalProps {
  onClose: () => void;
}

export const AddIncidentModal = ({ onClose }: AddIncidentModalProps) => {
  const { user } = useAuthStore();
  const { data: branchesData } = useGetBranchesQuery();
  const branches = Array.isArray(branchesData) ? branchesData : branchesData?.branches || [];
  const { data: channelsData } = useGetChannelsQuery();
  const channels = Array.isArray(channelsData) ? channelsData : channelsData?.channels || [];

  const [createIncident] = useCreateIncidentMutation();
  const [createAtmIncident] = useCreateAtmIncidentMutation();

  const [downtimeStart, setDowntimeStart] = useState<string>(new Date().toISOString());
  const [downtimeEnd, setDowntimeEnd] = useState<string>("");
  const [channel, setChannel] = useState<Channel>(Channel.ATM);
  const [reasonId, setReasonId] = useState("");
  const [remark, setRemark] = useState("");

  // ATM specific states
  const [branchId, setBranchId] = useState("");
  const [atmIds, setAtmIds] = useState<string[]>([]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downtimeStart || !reasonId || !user) return;

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
      onClose();
    } catch (error) {
      console.error("Failed to create incident", error);
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
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!reasonId || (isAtmChannel && (!branchId || atmIds.length === 0))}>
              Save Incident
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export const ResolveIncidentModal = ({ incidentId, onClose }: { incidentId: string, onClose: () => void }) => {
  const [downtimeEnd, setDowntimeEnd] = useState<string>(new Date().toISOString());

  const [updateIncident] = useUpdateIncidentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downtimeEnd) return;

    const formatDate = (iso: string) => format(new Date(iso), "yyyy-MM-dd HH:mm:ss");

    try {
      await updateIncident({
        id: incidentId,
        body: {
          downTimeEnd: formatDate(downtimeEnd),
          status: Status.COMPLETED,
        }
      }).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to resolve incident", error);
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
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date & Time</label>
              <DateTimePicker date={downtimeEnd} onChange={setDowntimeEnd} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t p-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="default" className="bg-green-600 hover:bg-green-700">Complete Incident</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
