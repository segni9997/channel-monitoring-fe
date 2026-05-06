import { useState, useMemo } from "react";
import {
  useCreateAdminMutation,
  useToggleAdminStatusMutation,
  useGetUsersQuery,
} from "@/api/userApi";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/shared/Loader";
import {
  Plus, X, Check, ToggleLeft, ToggleRight, ShieldCheck, RefreshCw,
} from "lucide-react";
import { Role } from "@/types";

interface AdminForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

const emptyForm = (): AdminForm => ({
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
});

export const SuperAdminUserMgmt = () => {
  // Use the working /admin/users endpoint and filter by admin role
  const { data: allUsers = [], isLoading, isError, refetch, isFetching } = useGetUsersQuery();
  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const [toggleStatus, { isLoading: isToggling }] = useToggleAdminStatusMutation();

  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<AdminForm>(emptyForm());
  const [formError, setFormError] = useState("");
  const [togglingId, setTogglingId] = useState<string | number | null>(null);
console.log("allUsers",allUsers)
  // Filter only admin-role users from the shared users list
  const admins = useMemo(
    () => allUsers.filter((u: any) => u.role === Role.admin || u.role === "admin"),
    [allUsers]
  );

  const handleNameChange = (field: "firstName" | "lastName", value: string) => {
    const next = { ...form, [field]: value };
    if (next.firstName && next.lastName) {
      next.email = `${next.firstName.toLowerCase()}.${next.lastName.toLowerCase()}@berhanbanksc.com`;
    }
    setForm(next);
  };

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phoneNumber || !form.password) {
      setFormError("All fields are required.");
      return;
    }
    setFormError("");
    try {
      await createAdmin(form).unwrap();
      setIsAdding(false);
      setForm(emptyForm());
      refetch();
    } catch (e: any) {
      setFormError(e?.data?.message ?? e?.data?.error ?? "Failed to create admin. Check the fields and try again.");
    }
  };

  const handleToggle = async (id: string | number) => {
    setTogglingId(id);
    try {
      await toggleStatus({ id }).unwrap();
      refetch();
    } catch (_e) {
      // silently fail — backend may not respond with body
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage Admin accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            id="refresh_admins_btn"
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
          <Button
            id="add_admin_btn"
            onClick={() => { setIsAdding(true); setForm(emptyForm()); setFormError(""); }}
            disabled={isAdding}
            className="shadow-lg shadow-primary/20 gap-2"
          >
            <Plus className="h-4 w-4" />
            New Admin
          </Button>
        </div>
      </div>

      {/* Create Admin Form — shown above the table when adding */}
      {isAdding && (
        <Card className="border-accent/40 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Create New Admin</CardTitle>
            <CardDescription>Fill in all fields to create a new Admin account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">First Name *</label>
                <Input
                  id="new_admin_firstname"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={(e) => handleNameChange("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Last Name *</label>
                <Input
                  id="new_admin_lastname"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={(e) => handleNameChange("lastName", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Email *</label>
                <Input
                  id="new_admin_email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Phone Number *</label>
                <Input
                  id="new_admin_phone"
                  placeholder="Phone Number"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Password *</label>
                <Input
                  id="new_admin_password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            {formError && (
              <p className="text-sm text-destructive mt-3 bg-destructive/10 px-3 py-2 rounded-md">
                {formError}
              </p>
            )}

            <div className="flex items-center gap-2 mt-4">
              {isCreating ? (
                <Loader />
              ) : (
                <>
                  <Button
                    id="confirm_create_admin_btn"
                    onClick={handleCreate}
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Create Admin
                  </Button>
                  <Button
                    id="cancel_create_admin_btn"
                    variant="outline"
                    onClick={() => { setIsAdding(false); setFormError(""); setForm(emptyForm()); }}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            Admin Accounts
          </CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${admins.length} admin account${admins.length !== 1 ? "s" : ""} found.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader /></div>
          ) : isError ? (
            <div className="py-12 text-center text-destructive text-sm">
              Failed to load admin list.{" "}
              <button onClick={() => refetch()} className="underline hover:opacity-70">Retry</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No admin accounts found. Use "New Admin" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin: any) => {
                      const isActive = !!(admin.is_active ?? admin.is_active ?? (admin.is_active === "active"));
                      const isCurrentlyToggling = togglingId === admin.id;
                      return (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium">
                            {admin.firstName} {admin.lastName}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {admin.email}
                          </TableCell>
                          <TableCell className="text-sm">
                            {admin.phoneNumber ?? admin.phone ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={isActive ? "default" : "secondary"}
                              className={
                                isActive
                                  ? "bg-green-100 text-green-700 border border-green-300"
                                  : "bg-red-100 text-red-700 border border-red-300"
                              }
                            >
                              {isActive ? "Active" : "Disabled"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              id={`toggle_admin_${admin.id}_btn`}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggle(admin.id)}
                              disabled={isCurrentlyToggling || isToggling}
                              className={`gap-2 text-xs ${
                                isActive
                                  ? "text-destructive hover:text-red-700 hover:bg-red-50"
                                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
                              }`}
                              title={isActive ? "Disable admin" : "Enable admin"}
                            >
                              {isCurrentlyToggling ? (
                                <Loader />
                              ) : isActive ? (
                                <>
                                  <ToggleLeft className="h-4 w-4" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="h-4 w-4" />
                                  Enable
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
