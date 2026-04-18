import { useState } from "react";
import { useIncidentStore } from "@/store/incidentStore";
import { useReasonStore } from "@/store/reasonStore";
import { useAuthStore } from "@/store/authStore";
import { Channel } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

interface AddIncidentModalProps {
  onClose: () => void;
}

export const AddIncidentModal = ({ onClose }: AddIncidentModalProps) => {
  const { addIncident } = useIncidentStore();
  const { reasons } = useReasonStore();
  const { user } = useAuthStore();

  const [downtimeStart, setDowntimeStart] = useState<string>(new Date().toISOString());
  const [downtimeEnd, setDowntimeEnd] = useState<string>("");
  const [channel, setChannel] = useState<Channel>(Channel.ATM);
  const [reasonId, setReasonId] = useState("");
  const [remark, setRemark] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!downtimeStart || !reasonId || !user) return;

    addIncident({
      downtimeStart,
      downtimeEnd: downtimeEnd || undefined,
      channel,
      reasonId,
      remark,
      createdBy: user.id
    });

    onClose();
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
                onChange={(e) => setChannel(e.target.value as Channel)}
                options={Object.values(Channel).map(c => ({ value: c, label: c.replace("_", " ") }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason *</label>
              <Select
                value={reasonId}
                onChange={(e) => setReasonId(e.target.value)}
                options={[{ value: "", label: "-- Select Reason --" }, ...reasons.map(r => ({ value: r.id, label: r.description }))]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Remark</label>
              <Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Provide any additional details..." />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t p-4 mt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!reasonId}>Save Incident</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export const ResolveIncidentModal = ({ incidentId, onClose }: { incidentId: string, onClose: () => void }) => {
  const { updateIncident } = useIncidentStore();
  const [downtimeEnd, setDowntimeEnd] = useState<string>(new Date().toISOString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!downtimeEnd) return;

    updateIncident(incidentId, {
      downtimeEnd
    });

    onClose();
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
