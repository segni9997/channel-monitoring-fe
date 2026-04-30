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
import { useCreateUserMutation, useGetUsersQuery, useUpdateUserMutation } from "@/api/userApi";
import { Loader } from "@/components/shared/Loader";

export const AdminUserMgmt = () => {
  const {  page, pageSize, setPage, setPageSize } = useUserStore();
  const { user: currentUser } = useAuthStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const {data:users,isLoading,isError,refetch}= useGetUsersQuery()
  const [addUser, { isLoading: isAddingUser }] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  // const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutuation();
  console.log("users", users)
  // Form states
  const [formData, setFormData] = useState<Partial<User>>({});
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      const roleName = u.role.toLowerCase().replace("_", " ");
      return (
        fullName.includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.phoneNumber.toLowerCase().includes(query) ||
        roleName.includes(query)
      );
    });
  }, [users, searchQuery]);

  const pagedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader/></div>;
  if (isError) return <div className="flex justify-center items-center h-screen">error</div>;

  const startEdit = (user: User) => {
    setEditingId(user.id.toString());
    setFormData(user);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ role: Role.pms_offcier, firstName: "", lastName: "", email: "", phoneNumber: "", password: "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({});
  };

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.role || (isAdding && !formData.password)) return;

    // Email domain restriction - Bypassed for super_admin
    const emailDomain = "@berhanbanksc.com";
    const isSuperAdmin = currentUser?.role === Role.super_admin;
    
    if (!isSuperAdmin && !formData.email?.toLowerCase().endsWith(emailDomain)) {
      alert(`Invalid email domain. Only ${emailDomain} is permitted.`);
      return;
    }

    if (isAdding) {
      addUser(formData as Omit<User, "id" | "created_at" | "updated_at"> & { password: string });
      refetch();
    } else if (editingId) {
      updateUser({id:Number(editingId),data:formData as Omit<User, "password" > });
      refetch();
    }
    cancelEdit();
  };

  // Auto-fill email when firstName and lastName are entered
  const handleNameChange = (field: "firstName" | "lastName", value: string) => {
    const nextData = { ...formData, [field]: value };
    
    // Auto-generate email only when both names are present and if the user hasn't manually edited the email significantly
    // or specifically when adding a new user.
    if (isAdding && nextData.firstName && nextData.lastName) {
      nextData.email = `${nextData.firstName.toLowerCase()}.${nextData.lastName.toLowerCase()}@berhanbanksc.com`;
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
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-10 shadow-sm border-accent/20 focus-visible:ring-accent"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <Button onClick={startAdd} disabled={isAdding || !!editingId} className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Active Directory</CardTitle>
          <CardDescription>A list of all users and their configured roles within the platform.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Password</TableHead>
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
                      <Input value={formData.phoneNumber || ""} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="Phone" />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                        options={[
                          ...(currentUser?.role === Role.super_admin ? [{ value: Role.admin, label: "Admin" }] : []),
                          { value: Role.pms_offcier, label: "PMS Officer" },
                          { value: Role.epayment_officer, label: "E-Payment Officer" }
                        ]}
                      />

                      
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="password" 
                        value={formData.password || ""} 
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                        placeholder="Password" 
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                        {isAddingUser  ? <Loader/> : <>   <Button variant="ghost" size="icon" onClick={handleSave} className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={cancelEdit} className="text-destructive hover:text-red-700"><X className="h-4 w-4" /></Button></>}
                    </TableCell>
                  </TableRow>
                )}
                {pagedUsers.map((u) => {
                  const isEditing = editingId === u.id.toString();
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
                        {isEditing ? <Input value={formData.phoneNumber || ""} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} /> : u.phoneNumber}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                            options={[
                              ...(currentUser?.role === Role.super_admin ? [{ value: Role.admin, label: "Admin" }] : []),
                              { value: Role.pms_offcier, label: "PMS Officer" },
                              { value: Role.epayment_officer, label: "E-Payment Officer" }
                            ]}
                          />
                        ) : (
                          <Badge variant={u.role === Role.admin ? "default" : "secondary"}>
                            {u.role.replace("_", " ")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input 
                            type="password" 
                            value={formData.password || ""} 
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                            placeholder="New password" 
                          />
                        ) : (
                          <span className="text-muted-foreground italic text-xs">********</span>
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
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => startEdit(u)} 
                              disabled={
                                !!editingId || 
                                isAdding || 
                                u.id === currentUser?.id || 
                                (currentUser?.role === Role.admin && (u.role === Role.admin || u.role === Role.super_admin))
                              } 
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              // onClick={() => deleteUser(u.id.toString())} 
                              disabled={
                                !!editingId || 
                                isAdding || 
                                u.id === currentUser?.id ||
                                (currentUser?.role === Role.admin && (u.role === Role.admin || u.role === Role.super_admin))
                              } 
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
            totalCount={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
};
