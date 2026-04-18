import { useState, useMemo } from "react";
import { useReasonStore } from "@/store/reasonStore";
import {type  Reason } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";

export const AdminReasonMgmt = () => {
  const { reasons, page, pageSize, setPage, setPageSize, addReason, updateReason, deleteReason } = useReasonStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [description, setDescription] = useState("");

  const pagedReasons = useMemo(() => {
    const start = (page - 1) * pageSize;
    return reasons.slice(start, start + pageSize);
  }, [reasons, page, pageSize]);

  const startEdit = (reason: Reason) => {
    setEditingId(reason.id);
    setDescription(reason.description);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setDescription("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setDescription("");
  };

  const handleSave = () => {
    if (!description) return;

    if (isAdding) {
      addReason({ description });
    } else if (editingId) {
      updateReason(editingId, description);
    }
    cancelEdit();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Downtime Reasons</h1>
          <p className="text-muted-foreground mt-1">Manage system-wide outage categorization.</p>
        </div>
        <Button onClick={startAdd} disabled={isAdding || !!editingId}>
          <Plus className="mr-2 h-4 w-4" /> Add Reason
        </Button>
      </div>

      <Card className="shadow-sm max-w-3xl">
        <CardHeader>
          <CardTitle>Configured Reasons</CardTitle>
          <CardDescription>Values configured here appear in the dropdown when logging an incident.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead className="w-[60%]">Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAdding && (
                <TableRow className="bg-muted/50">
                  <TableCell className="text-muted-foreground text-xs italic">Auto-generated</TableCell>
                  <TableCell>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Network Disconnect" />
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
                    <TableCell className="font-medium text-xs text-muted-foreground">{r.id}</TableCell>
                    <TableCell>
                      {isEditing ? <Input value={description} onChange={(e) => setDescription(e.target.value)} /> : r.description}
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
    </div>
  );
};

