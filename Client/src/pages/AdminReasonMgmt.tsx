import { useState, useMemo } from "react";
import { useReasonStore } from "@/store/reasonStore";
import { useDepartmentStore } from "@/store/departmentStore";
import { type Reason, type Department } from "@/types";
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
import { Plus, Edit2, Trash2, X, Check, Building2, ListTree } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export const AdminReasonMgmt = () => {
  const { reasons, page, pageSize, setPage, setPageSize, addReason, updateReason, deleteReason } = useReasonStore();
  const { departments, addDepartment, updateDepartment, deleteDepartment } = useDepartmentStore();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states for Reasons
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  // Form states for Departments
  const [deptEditingId, setDeptEditingId] = useState<string | null>(null);
  const [isAddingDept, setIsAddingDept] = useState(false);
  const [deptName, setDeptName] = useState("");

  const pagedReasons = useMemo(() => {
    const start = (page - 1) * pageSize;
    return reasons.slice(start, start + pageSize);
  }, [reasons, page, pageSize]);

  const getDepartmentName = (id: string) => {
    return departments.find(d => d.id === id)?.name || "Unknown Department";
  };

  // Reason Handlers
  const startEdit = (reason: Reason) => {
    setEditingId(reason.id);
    setName(reason.name);
    setDepartmentId(reason.departmentId);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setName("");
    setDepartmentId("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setName("");
    setDepartmentId("");
  };

  const handleSave = () => {
    if (!name || !departmentId) return;

    if (isAdding) {
      addReason({ name, departmentId });
    } else if (editingId) {
      updateReason(editingId, { name, departmentId });
    }
    cancelEdit();
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

  const handleSaveDept = () => {
    if (!deptName) return;

    if (isAddingDept) {
      addDepartment(deptName);
    } else if (deptEditingId) {
      updateDepartment(deptEditingId, deptName);
    }
    cancelEditDept();
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
        <TabsList>
          <TabsTrigger value="reasons" className="flex items-center gap-2">
            <ListTree className="h-4 w-4" /> Reasons
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Departments
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10%] text-xs">Code</TableHead>
                    <TableHead className="w-[40%]">Reason Name</TableHead>
                    <TableHead className="w-[30%]">Responsible Department</TableHead>
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
                  {pagedReasons.map((r) => {
                    const isEditing = editingId === r.id;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-xs text-muted-foreground">{r.id.split('_')[1] || r.id}</TableCell>
                        <TableCell>
                          {isEditing ? <Input value={name} onChange={(e) => setName(e.target.value)} /> : r.name}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Select 
                              value={departmentId} 
                              onChange={(e) => setDepartmentId(e.target.value)}
                              options={departments.map(d => ({ value: d.id, label: d.name }))}
                            />
                          ) : getDepartmentName(r.departmentId)}
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
                              <Button variant="ghost" size="icon" onClick={() => deleteReason(r.id)} disabled={!!editingId || isAdding} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
                              <Button variant="ghost" size="icon" onClick={() => deleteDepartment(d.id)} disabled={!!deptEditingId || isAddingDept} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

