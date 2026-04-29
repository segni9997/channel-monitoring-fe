import { useState, useMemo } from "react";
import { 
  useGetBranchesQuery, 
  useCreateBranchMutation, 
  useUpdateBranchMutation, 
  useDeleteBranchMutation 
} from "@/api/branchApi";
import { 
  useGetAtmsQuery, 
  useCreateAtmMutation, 
  useUpdateAtmMutation, 
  useDeleteAtmMutation 
} from "@/api/atmApi";
import { type Branch, type ATM } from "@/types";
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
import { Plus, Edit2, Trash2, Search, ArrowRightLeft, Building2, Monitor } from "lucide-react";

export const AdminBranchMgmt = () => {
  const { data: branchesData } = useGetBranchesQuery();
  const branches = Array.isArray(branchesData) ? branchesData : branchesData?.branches || [];
  
  const { data: atmsData } = useGetAtmsQuery();
  const atms = Array.isArray(atmsData) ? atmsData : atmsData?.atms || [];

  const [createBranch] = useCreateBranchMutation();
  const [updateBranch] = useUpdateBranchMutation();
  const [deleteBranch] = useDeleteBranchMutation();

  const [createAtm] = useCreateAtmMutation();
  const [updateAtm] = useUpdateAtmMutation();
  const [deleteAtm] = useDeleteAtmMutation();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered Data
  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const branchMatch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      const relatedAtms = atms.filter(a => a.branchId === b.id);
      const atmMatch = relatedAtms.some(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                           a.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return branchMatch || atmMatch;
    });
  }, [branches, atms, searchQuery]);

  const pagedBranches = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredBranches.slice(start, start + pageSize);
  }, [filteredBranches, page, pageSize]);

  // Modal States
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [isAtmModalOpen, setIsAtmModalOpen] = useState(false);
  const [editingAtm, setEditingAtm] = useState<ATM | null>(null);
  const [selectedBranchIdForAtm, setSelectedBranchIdForAtm] = useState<string>("");

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferringAtm, setTransferringAtm] = useState<ATM | null>(null);
  const [newBranchId, setNewBranchId] = useState("");

  // Handlers
  const handleSaveBranch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;

    try {
      if (editingBranch) {
        await updateBranch({ id: editingBranch.id, body: { name, code } }).unwrap();
      } else {
        await createBranch({ name, code }).unwrap();
      }
      setIsBranchModalOpen(false);
      setEditingBranch(null);
    } catch (error) {
      console.error("Failed to save branch", error);
    }
  };

  const handleSaveAtm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const branchId = selectedBranchIdForAtm;

    try {
      if (editingAtm) {
        // Send both branchId and branch_id just in case the API strictly expects snake_case
        await updateAtm({ id: editingAtm.id, body: { name, branchId, branch_id: branchId } as any }).unwrap();
      } else {
        await createAtm({ name, branchId, branch_id: branchId } as any).unwrap();
      }
      setIsAtmModalOpen(false);
      setEditingAtm(null);
      setSelectedBranchIdForAtm("");
    } catch (error) {
      console.error("Failed to save ATM", error);
    }
  };

  const handleTransfer = async () => {
    if (transferringAtm && newBranchId) {
      try {
        await updateAtm({ id: transferringAtm.id, body: { branchId: newBranchId, branch_id: newBranchId } as any }).unwrap();
        setIsTransferModalOpen(false);
        setTransferringAtm(null);
        setNewBranchId("");
      } catch (error) {
        console.error("Failed to transfer ATM", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branch & ATM Management</h1>
          <p className="text-muted-foreground mt-1">Manage bank branches and their associated ATM terminals.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setEditingBranch(null); setIsBranchModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Branch
          </Button>
          <Button variant="outline" onClick={() => { setEditingAtm(null); setSelectedBranchIdForAtm(""); setIsAtmModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add ATM
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search branches or ATMs..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Network Hierarchy</CardTitle>
          <CardDescription>View all branches and their assigned ATM terminals.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Branch Details</TableHead>
                <TableHead className="w-[40%]">ATMs</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedBranches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                    No records found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                pagedBranches.map((branch) => {
                  const branchAtms = atms.filter((a: any) => String(a.branchId) === String(branch.id) || String(a.branch_id) === String(branch.id));
                  return (
                    <TableRow key={branch.id} className="align-top">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {branch.name}
                          </span>
                          {/* <span className="text-xs text-muted-foreground font-mono">Code: {branch.code}</span> */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {branchAtms.length === 0 ? (
                            <span className="text-xs text-muted-foreground italic">No ATMs assigned</span>
                          ) : (
                            branchAtms.map(atm => (
                              <div key={atm.id} className="flex items-center justify-between group bg-muted/30 p-2 rounded-md border border-transparent hover:border-border hover:bg-muted/50 transition-colors">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium flex items-center gap-2">
                                    <Monitor className="h-3 w-3" />
                                    {atm.name}
                                  </span>

                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7" 
                                    onClick={() => {
                                      setEditingAtm(atm);
                                      setSelectedBranchIdForAtm(branch.id);
                                      setIsAtmModalOpen(true);
                                    }}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7" 
                                    onClick={() => {
                                      setTransferringAtm(atm);
                                      setNewBranchId("");
                                      setIsTransferModalOpen(true);
                                    }}
                                  >
                                    <ArrowRightLeft className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-destructive hover:text-destructive" 
                                    onClick={() => deleteAtm(String(atm.id))}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-start text-xs h-8 border-dashed border hover:border-primary/50 hover:bg-primary/5"
                            onClick={() => {
                              setEditingAtm(null);
                              setSelectedBranchIdForAtm(branch.id);
                              setIsAtmModalOpen(true);
                            }}
                          >
                            <Plus className="mr-2 h-3 w-3" /> Add ATM to this branch
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingBranch(branch); setIsBranchModalOpen(true); }}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteBranch(branch.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <Pagination
            currentPage={page}
            totalCount={filteredBranches.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      {/* Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <form onSubmit={handleSaveBranch}>
              <CardHeader>
                <CardTitle>{editingBranch ? "Edit Branch" : "Add Branch"}</CardTitle>
                <CardDescription>Enter the branch details below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch Name</label>
                  <Input name="name" defaultValue={editingBranch?.name} required placeholder="e.g. Merkato Branch" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch Code</label>
                  <Input name="code" defaultValue={editingBranch?.code} required placeholder="e.g. 054" />
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 border-t p-4">
                <Button type="button" variant="ghost" onClick={() => setIsBranchModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Branch</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ATM Modal */}
      {isAtmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <form onSubmit={handleSaveAtm}>
              <CardHeader>
                <CardTitle>{editingAtm ? "Edit ATM" : "Add ATM"}</CardTitle>
                <CardDescription>Enter the ATM details and assign it to a branch.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ATM Name</label>
                  <Input name="name" defaultValue={editingAtm?.name} required placeholder="e.g. Entrance ATM" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch</label>
                  <Select 
                    value={selectedBranchIdForAtm}
                    onChange={(e) => setSelectedBranchIdForAtm(e.target.value)}
                    options={branches.map(b => ({ value: b.id, label: `${b.name} (${b.code})` }))}
                    placeholder="Select Branch"
                  />
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 border-t p-4">
                <Button type="button" variant="ghost" onClick={() => setIsAtmModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!selectedBranchIdForAtm}>Save ATM</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Transfer ATM Modal */}
      {isTransferModalOpen && transferringAtm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm shadow-xl">
            <CardHeader>
              <CardTitle>Transfer ATM</CardTitle>
              <CardDescription>
                Move <span className="font-semibold text-foreground">{transferringAtm.name}</span> to a different branch.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Branch</label>
                <Select 
                  value={newBranchId}
                  onChange={(e) => setNewBranchId(e.target.value)}
                  options={branches.filter(b => b.id !== transferringAtm.branchId && b.id !== (transferringAtm as any).branch_id).map(b => ({ value: b.id, label: `${b.name} (${b.code})` }))}
                  placeholder="Select Target Branch"
                />
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 border-t p-4">
              <Button type="button" variant="ghost" onClick={() => setIsTransferModalOpen(false)}>Cancel</Button>
              <Button onClick={handleTransfer} disabled={!newBranchId} className="bg-primary hover:bg-primary/90">
                Confirm Transfer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
