import { useState, useMemo } from "react";
import { useUserStore } from "@/store/userStore";
import { Role, type User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const AdminUserMgmt = () => {
  const { users, page, pageSize, setPage, setPageSize, addUser, updateUser, deleteUser } = useUserStore();
  const { user: currentUser } = useAuthStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<User>>({});

  const pagedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [users, page, pageSize]);

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setFormData(user);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ role: Role.PMS_OFFICER, firstName: "", lastName: "", email: "", phone: "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({});
  };

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) return;

    // Email domain restriction
    const emailDomain = "@berhanbank.com";
    if (!formData.email.toLowerCase().endsWith(emailDomain)) {
      alert(`Invalid email domain. Only ${emailDomain} is permitted.`);
      return;
    }

    if (isAdding) {
      addUser(formData as Omit<User, "id">);
    } else if (editingId) {
      updateUser(editingId, formData);
    }
    cancelEdit();
  };

  // Auto-fill email when firstName and lastName are entered
  const handleNameChange = (field: "firstName" | "lastName", value: string) => {
    const nextData = { ...formData, [field]: value };
    
    // Auto-generate email only when both names are present and if the user hasn't manually edited the email significantly
    // or specifically when adding a new user.
    if (isAdding && nextData.firstName && nextData.lastName) {
      nextData.email = `${nextData.firstName.toLowerCase()}.${nextData.lastName.toLowerCase()}@berhanbank.com`;
    }
    
    setFormData(nextData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Users</h1>
          <p className="text-muted-foreground mt-1">Manage personnel access and roles.</p>
        </div>
        <Button onClick={startAdd} disabled={isAdding || !!editingId}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Active Directory</CardTitle>
          <CardDescription>A list of all users and their configured roles within the platform.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAdding && (
                <TableRow className="bg-muted/50">
                  <TableCell>
                    <Input value={formData.firstName || ""} onChange={(e) => handleNameChange("firstName", e.target.value)} placeholder="First Name" />
                  </TableCell>
                  <TableCell>
                    <Input value={formData.lastName || ""} onChange={(e) => handleNameChange("lastName", e.target.value)} placeholder="Last Name" />
                  </TableCell>
                  <TableCell>
                    <Input value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email" />
                  </TableCell>
                  <TableCell>
                    <Input value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone" />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                      options={[
                        { value: Role.ADMIN, label: "Admin" },
                        { value: Role.PMS_OFFICER, label: "PMS Officer" },
                        { value: Role.EPAYMENT_OFFICER, label: "E-Payment Officer" }
                      ]}
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={handleSave} className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={cancelEdit} className="text-destructive hover:text-red-700"><X className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              )}
              {pagedUsers.map((u) => {
                const isEditing = editingId === u.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {isEditing ? <Input value={formData.firstName || ""} onChange={(e) => handleNameChange("firstName", e.target.value)} /> : u.firstName}
                    </TableCell>
                    <TableCell className="font-medium">
                      {isEditing ? <Input value={formData.lastName || ""} onChange={(e) => handleNameChange("lastName", e.target.value)} /> : u.lastName}
                    </TableCell>
                    <TableCell>
                      {isEditing ? <Input value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /> : u.email}
                    </TableCell>
                    <TableCell>
                      {isEditing ? <Input value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /> : u.phone}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                          options={[
                            { value: Role.ADMIN, label: "Admin" },
                            { value: Role.PMS_OFFICER, label: "PMS Officer" },
                            { value: Role.EPAYMENT_OFFICER, label: "E-Payment Officer" }
                          ]}
                        />
                      ) : (
                        <Badge variant={u.role === Role.ADMIN ? "default" : "secondary"}>
                          {u.role.replace("_", " ")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {isEditing ? (
                        <>
                          <Button variant="ghost" size="icon" onClick={handleSave} className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={cancelEdit} className="text-destructive hover:text-red-700"><X className="h-4 w-4" /></Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => startEdit(u)} disabled={!!editingId || isAdding || u.id === currentUser?.id} className="text-muted-foreground hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteUser(u.id)} disabled={!!editingId || isAdding || u.id === currentUser?.id} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
            totalCount={users.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
};
