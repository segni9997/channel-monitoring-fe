import { useState, useMemo } from "react";
import { 
  useGetReasonsQuery, 
  useCreateReasonMutation, 
  useUpdateReasonMutation, 
  useDeleteReasonMutation 
} from "@/api/reasonApi";
import { 
  useGetDepartmentsQuery, 
  useCreateDepartmentMutation, 
  useUpdateDepartmentMutation, 
  useDeleteDepartmentMutation 
} from "@/api/departmentApi";
import { 
  useGetChannelsQuery, 
  useCreateChannelMutation, 
  useUpdateChannelMutation, 
  useDeleteChannelMutation 
} from "@/api/channelApi";
import {  type Department } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Edit2, Trash2, X, Check, Building2, ListTree, Network } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export const AdminReasonMgmt = () => {
  const { data: reasonsData } = useGetReasonsQuery({});
  const reasons = Array.isArray(reasonsData) ? reasonsData : reasonsData?.reasons || [];
  
  const { data: deptsData } = useGetDepartmentsQuery();
  const departments = Array.isArray(deptsData) ? deptsData : deptsData?.departments || [];

  const { data: channelsData } = useGetChannelsQuery();
  const channels = Array.isArray(channelsData) ? channelsData : channelsData?.channels || [];

  const [createReason] = useCreateReasonMutation();
  const [updateReason] = useUpdateReasonMutation();
  const [deleteReason] = useDeleteReasonMutation();

  const [createDepartment] = useCreateDepartmentMutation();
  const [updateDepartment] = useUpdateDepartmentMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();

  const [createChannel] = useCreateChannelMutation();
  const [updateChannel] = useUpdateChannelMutation();
  const [deleteChannel] = useDeleteChannelMutation();
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states for Reasons
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [channelId, setChannelId] = useState<string>("");

  // Form states for Departments
  const [deptEditingId, setDeptEditingId] = useState<string | null>(null);
  const [isAddingDept, setIsAddingDept] = useState(false);
  const [deptName, setDeptName] = useState("");

  // Form states for Channels
  const [channelEditingId, setChannelEditingId] = useState<string | null>(null);
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [channelName, setChannelName] = useState("");

  const pagedReasons = useMemo(() => {
    const start = (page - 1) * pageSize;
    return reasons.slice(start, start + pageSize);
  }, [reasons, page, pageSize]);

  const getDepartmentName = (id: string) => {
    console.log(departments, id + "dfsdfs");
    return departments.find(d => d.id.toString() === id)?.name || "Unknown Department";
  };

  // Reason Handlers
  const startEdit = (reason: any) => {
    setEditingId(reason.id);
    setName(reason.name);
    setDepartmentId(reason.responsible_dept || reason.departmentId || "");
    setChannelId(reason.channel_id || (reason.channel?.id ? String(reason.channel.id) : ""));
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setName("");
    setDepartmentId("");
    setChannelId("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setName("");
    setDepartmentId("");
    setChannelId("");
  };

  const handleSave = async () => {
    if (!name || !departmentId || !channelId) return;

    try {
      if (isAdding) {
        console.log(name, channelId,  departmentId)
        await createReason({ name,  channel_id :channelId, responsible_dept: departmentId.toString() }).unwrap();
      } else if (editingId) {
        await updateReason({ id: editingId, body: { name, channel_id:channelId, responsible_dept: departmentId.toString() } }).unwrap();
      }
      cancelEdit();
    } catch (error) {
      console.error("Failed to save reason", error);
    }
  };

  // Department Handlers
  const startEditDept = (dept: Department) => {
    setDeptEditingId(dept.id);
    setDeptName(dept.name);
    setIsAddingDept(false);
  };

  const startAddDept = () => {
    setIsAddingDept(true);
    setDeptEditingId(null);
    setDeptName("");
  };

  const cancelEditDept = () => {
    setDeptEditingId(null);
    setIsAddingDept(false);
    setDeptName("");
  };

  const handleSaveDept = async () => {
    if (!deptName) return;

    try {
      if (isAddingDept) {
        await createDepartment({ name: deptName }).unwrap();
      } else if (deptEditingId) {
        await updateDepartment({ id: deptEditingId, body: { name: deptName } }).unwrap();
      }
      cancelEditDept();
    } catch (error) {
      console.error("Failed to save department", error);
    }
  };

  // Channel Handlers
  const startEditChannel = (channel: any) => {
    setChannelEditingId(channel.id);
    setChannelName(channel.name);
    setIsAddingChannel(false);
  };

  const startAddChannel = () => {
    setIsAddingChannel(true);
    setChannelEditingId(null);
    setChannelName("");
  };

  const cancelEditChannel = () => {
    setChannelEditingId(null);
    setIsAddingChannel(false);
    setChannelName("");
  };

  const handleSaveChannel = async () => {
    if (!channelName) return;

    try {
      if (isAddingChannel) {
        await createChannel({ name: channelName }).unwrap();
      } else if (channelEditingId) {
        await updateChannel({ id: channelEditingId, body: { name: channelName } }).unwrap();
      }
      cancelEditChannel();
    } catch (error) {
      console.error("Failed to save channel", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
          <p className="text-muted-foreground mt-1">Manage downtime reasons and responsible departments.</p>
        </div>
      </div>

      <Tabs defaultValue="reasons" className="space-y-4">
        <TabsList className="w-full flex justify-start lg:justify-center overflow-x-auto overflow-y-hidden h-auto p-1 gap-2 bg-muted/50">
          <TabsTrigger value="reasons" className="flex items-center gap-2 whitespace-nowrap">
            <ListTree className="h-4 w-4" /> Reasons
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2 whitespace-nowrap">
            <Building2 className="h-4 w-4" /> Departments
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center gap-2 whitespace-nowrap">
            <Network className="h-4 w-4" /> Channels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reasons" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={startAdd} disabled={isAdding || !!editingId}>
              <Plus className="mr-2 h-4 w-4" /> Add Reason
            </Button>
          </div>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Downtime Reasons</CardTitle>
              <CardDescription>Configure reasons that appear when logging incidents.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[10%] text-xs">Code</TableHead>
                      <TableHead className="w-[30%]">Reason Name</TableHead>
                      <TableHead className="w-[20%]">Channel</TableHead>
                      <TableHead className="w-[25%]">Responsible Department</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isAdding && (
                      <TableRow className="bg-muted/50">
                        <TableCell className="text-muted-foreground text-xs italic">Auto</TableCell>
                        <TableCell>
                          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Reason Name" />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={channelId} 
                            onChange={(e) => setChannelId(e.target.value)}
                            options={channels.map((c: any) => ({ value: c.id, label: c.name }))}
                            placeholder="Select Channel"
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={departmentId} 
                            onChange={(e) => setDepartmentId(e.target.value)}
                            options={departments.map(d => ({ value: d.id, label: d.name }))}
                            placeholder="Select Department"
                          />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={handleSave} className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={cancelEdit} className="text-destructive hover:text-red-700"><X className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    )}
                    {pagedReasons.map((r: any) => {
                      const isEditing = String(editingId) === String(r.id);
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium text-xs text-muted-foreground">{String(r.id)}</TableCell>
                          <TableCell>
                            {isEditing ? <Input value={name} onChange={(e) => setName(e.target.value)} /> : r.name}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Select 
                                value={channelId} 
                                onChange={(e) => setChannelId(e.target.value)}
                                options={channels.map((c: any) => ({ value: c.id, label: c.name }))}
                              />
                            ) : (r.channel?.name || "N/A")}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Select 
                                value={departmentId} 
                                onChange={(e) => setDepartmentId(e.target.value)}
                                options={departments.map(d => ({ value: d.id, label: d.name }))}
                              />
                            ) : getDepartmentName(r.responsible_dept || r.departmentId)}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {isEditing ? (
                              <>
                                <Button variant="ghost" size="icon" onClick={handleSave} className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={cancelEdit} className="text-destructive hover:text-red-700"><X className="h-4 w-4" /></Button>
                              </>
                            ) : (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => startEdit(r)} disabled={!!editingId || isAdding} className="text-muted-foreground hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => deleteReason(String(r.id))} disabled={!!editingId || isAdding} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                currentPage={page}
                totalCount={reasons.length}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={startAddDept} disabled={isAddingDept || !!deptEditingId}>
              <Plus className="mr-2 h-4 w-4" /> Add Department
            </Button>
          </div>
          <Card className="shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle>Departments</CardTitle>
              <CardDescription>Manage departments responsible for system outages.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isAddingDept && (
                      <TableRow className="bg-muted/50">
                        <TableCell>
                          <Input value={deptName} onChange={(e) => setDeptName(e.target.value)} placeholder="e.g. IT Security" />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={handleSaveDept} className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={cancelEditDept} className="text-destructive hover:text-red-700"><X className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    )}
                    {departments.map((d) => {
                      const isEditing = deptEditingId === d.id;
                      return (
                        <TableRow key={d.id}>
                          <TableCell>
                            {isEditing ? <Input value={deptName} onChange={(e) => setDeptName(e.target.value)} /> : d.name}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {isEditing ? (
                              <>
                                <Button variant="ghost" size="icon" onClick={handleSaveDept} className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={cancelEditDept} className="text-destructive hover:text-red-700"><X className="h-4 w-4" /></Button>
                              </>
                            ) : (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => startEditDept(d)} disabled={!!deptEditingId || isAddingDept} className="text-muted-foreground hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => deleteDepartment(String(d.id))} disabled={!!deptEditingId || isAddingDept} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="channels" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={startAddChannel} disabled={isAddingChannel || !!channelEditingId}>
              <Plus className="mr-2 h-4 w-4" /> Add Channel
            </Button>
          </div>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Communication Channels</CardTitle>
              <CardDescription>Configure service channels available for incidents.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[10%] text-xs">Code</TableHead>
                      <TableHead className="w-[70%]">Channel Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isAddingChannel && (
                      <TableRow className="bg-muted/50">
                        <TableCell className="text-muted-foreground text-xs italic">Auto</TableCell>
                        <TableCell>
                          <Input value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="Channel Name" />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={handleSaveChannel} className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={cancelEditChannel} className="text-destructive hover:text-red-700"><X className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    )}
                    {channels.map((c: any) => {
                      const isEditing = channelEditingId === c.id;
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium text-xs text-muted-foreground">{String(c.id)}</TableCell>
                          <TableCell>
                            {isEditing ? <Input value={channelName} onChange={(e) => setChannelName(e.target.value)} /> : c.name}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {isEditing ? (
                              <>
                                <Button variant="ghost" size="icon" onClick={handleSaveChannel} className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={cancelEditChannel} className="text-destructive hover:text-red-700"><X className="h-4 w-4" /></Button>
                              </>
                            ) : (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => startEditChannel(c)} disabled={!!channelEditingId || isAddingChannel} className="text-muted-foreground hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => deleteChannel(String(c.id))} disabled={!!channelEditingId || isAddingChannel} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

