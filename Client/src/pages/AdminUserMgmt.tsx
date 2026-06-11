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
import { Plus, Edit2, Trash2, X, Check, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateAdminMutation, useCreateUserMutation, useGetUsersQuery, useUpdateUserMutation } from "@/api/userApi";
import { Loader } from "@/components/shared/Loader";

export const AdminUserMgmt = () => {
  const {  page, pageSize, setPage, setPageSize } = useUserStore();
  const { user: currentUser } = useAuthStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const {data:users,isLoading,isError,refetch}= useGetUsersQuery()
  const [addUser, { isLoading: isAddingUser }] = useCreateUserMutation();
  const [createAdmin, { isLoading: isCreatingAdmin }] = useCreateAdminMutation();
  const [updateUser] = useUpdateUserMutation();
  // const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutuation();
  console.log("users", users)
  // Form states
  const [formData, setFormData] = useState<Partial<User>>({});
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  // Per-field validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    setErrorMsg("");
    setSuccessMsg("");
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ role: Role.pms_offcier, firstName: "", lastName: "", email: "", phoneNumber: "", password: "" });
    setErrorMsg("");
    setSuccessMsg("");
    setFieldErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({});
    setErrorMsg("");
    setFieldErrors({});
  };

  // Validate form and return field-level errors map
  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    const emailDomain = "@berhanbanksc.com";
    const isSuperAdmin = currentUser?.role === Role.super_admin;

    if (!formData.firstName?.trim()) errs.firstName = "First name is required.";
    if (!formData.lastName?.trim()) errs.lastName = "Last name is required.";

    if (!formData.email?.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Enter a valid email address.";
    } else if (!isSuperAdmin && !formData.email.toLowerCase().endsWith(emailDomain)) {
      errs.email = `Only ${emailDomain} addresses are allowed.`;
    }

    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber.replace(/[\s\-()]/g, ""))) {
      errs.phoneNumber = "Phone must be 10 digits.";
    }

    if (isAdding && !formData.password) {
      errs.password = "Password is required.";
    } else if (isAdding && formData.password && formData.password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    }

    if (!formData.role) errs.role = "Role is required.";

    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setErrorMsg("Please fix the errors below before saving.");
      return;
    }

    setFieldErrors({});
    setErrorMsg("");
    setSuccessMsg("");

    // Map backend field-level errors (Laravel validation format)
    const applyBackendErrors = (err: any) => {
      const backendErrors: Record<string, string> = {};
      if (err?.data?.errors) {
        const map: Record<string, string> = {
          first_name: "firstName", firstName: "firstName",
          last_name: "lastName",  lastName: "lastName",
          email: "email",
          phone_number: "phoneNumber", phoneNumber: "phoneNumber",
          password: "password",
        };
        for (const [key, msgs] of Object.entries(err.data.errors as Record<string, string | string[]>)) {
          const fieldKey = map[key] ?? key;
          backendErrors[fieldKey] = Array.isArray(msgs) ? msgs[0] : msgs;
        }
      }
      if (Object.keys(backendErrors).length > 0) setFieldErrors(backendErrors);
      setErrorMsg(
        err?.data?.message || err?.data?.error ||
        (Object.keys(backendErrors).length > 0 ? "Fix the highlighted fields and try again." : "Request failed. Please try again.")
      );
    };

    if (isAdding) {
      console.log("formdata",formData)
      if (formData.role === Role.admin) {
        const adminData = formData;
        createAdmin({
          firstName: adminData.firstName as string,
          lastName: adminData.lastName as string,
          email: adminData.email as string,
          phoneNumber: adminData.phoneNumber as string,
          password: adminData.password as string,
        }).unwrap().then(() => {
          setSuccessMsg("Admin account created successfully!");
          refetch();
          cancelEdit();
          setTimeout(() => setSuccessMsg(""), 3000);
        }).catch((err) => {
          console.error("Failed to create admin:", err);
          applyBackendErrors(err);
        });
      } else {
        addUser(formData as Omit<User, "id" | "created_at" | "updated_at"> & { password: string }).unwrap().then(() => {
          setSuccessMsg("User created successfully!");
          refetch();
          cancelEdit();
          setTimeout(() => setSuccessMsg(""), 3000);
        }).catch((err) => {
          console.error("Failed to create user:", err);
          applyBackendErrors(err);
        });
      }
    } else if (editingId) {
      updateUser({id:Number(editingId),data:formData as Omit<User, "password" > }).unwrap().then(() => {
        setSuccessMsg("User updated successfully!");
        refetch();
        cancelEdit();
        setTimeout(() => setSuccessMsg(""), 3000);
      }).catch((err) => {
        console.error("Failed to update user:", err);
        applyBackendErrors(err);
      });
    }
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
                d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.35-4.35"
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

      {successMsg && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2.5 rounded-md border border-green-200 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-md border border-destructive/20 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

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
                      <div className="space-y-1">
                        <Input
                          value={formData.firstName || ""}
                          onChange={(e) => { handleNameChange("firstName", e.target.value); setFieldErrors(p => ({ ...p, firstName: "" })); }}
                          placeholder="First Name"
                          className={fieldErrors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {fieldErrors.firstName && <p className="text-xs text-destructive">{fieldErrors.firstName}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Input
                          value={formData.lastName || ""}
                          onChange={(e) => { handleNameChange("lastName", e.target.value); setFieldErrors(p => ({ ...p, lastName: "" })); }}
                          placeholder="Last Name"
                          className={fieldErrors.lastName ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {fieldErrors.lastName && <p className="text-xs text-destructive">{fieldErrors.lastName}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Input
                          value={formData.email || ""}
                          onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setFieldErrors(p => ({ ...p, email: "" })); }}
                          placeholder="Email"
                          className={fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Input
                          value={formData.phoneNumber || ""}
                          onChange={(e) => { setFormData({ ...formData, phoneNumber: e.target.value }); setFieldErrors(p => ({ ...p, phoneNumber: "" })); }}
                          placeholder="Phone"
                          className={fieldErrors.phoneNumber ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {fieldErrors.phoneNumber && <p className="text-xs text-destructive">{fieldErrors.phoneNumber}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Select
                          value={formData.role}
                          onChange={(e) => { setFormData({ ...formData, role: e.target.value as Role }); setFieldErrors(p => ({ ...p, role: "" })); }}
                          options={[
                            ...(currentUser?.role === Role.super_admin ? [{ value: Role.admin, label: "Admin" }] : []),
                            { value: Role.pms_offcier, label: "PMS Officer" },
                            { value: Role.epayment_officer, label: "E-Payment Officer" }
                          ]}
                        />
                        {fieldErrors.role && <p className="text-xs text-destructive">{fieldErrors.role}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Input
                          type="password"
                          value={formData.password || ""}
                          onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setFieldErrors(p => ({ ...p, password: "" })); }}
                          placeholder="Password (min 8 chars)"
                          className={fieldErrors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {isAddingUser || isCreatingAdmin ? <Loader/> : <>
                        <Button variant="ghost" size="icon" onClick={handleSave} className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={cancelEdit} className="text-destructive hover:text-red-700"><X className="h-4 w-4" /></Button>
                      </>}
                    </TableCell>
                  </TableRow>
                )}
                {pagedUsers.map((u) => {
                  const isEditing = editingId === u.id.toString();
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {isEditing ? (
                          <div className="space-y-1">
                            <Input value={formData.firstName || ""} onChange={(e) => { handleNameChange("firstName", e.target.value); setFieldErrors(p => ({ ...p, firstName: "" })); }} className={fieldErrors.firstName ? "border-destructive" : ""} />
                            {fieldErrors.firstName && <p className="text-xs text-destructive">{fieldErrors.firstName}</p>}
                          </div>
                        ) : u.firstName}
                      </TableCell>
                      <TableCell className="font-medium">
                        {isEditing ? (
                          <div className="space-y-1">
                            <Input value={formData.lastName || ""} onChange={(e) => { handleNameChange("lastName", e.target.value); setFieldErrors(p => ({ ...p, lastName: "" })); }} className={fieldErrors.lastName ? "border-destructive" : ""} />
                            {fieldErrors.lastName && <p className="text-xs text-destructive">{fieldErrors.lastName}</p>}
                          </div>
                        ) : u.lastName}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="space-y-1">
                            <Input value={formData.email || ""} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setFieldErrors(p => ({ ...p, email: "" })); }} className={fieldErrors.email ? "border-destructive" : ""} />
                            {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
                          </div>
                        ) : u.email}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="space-y-1">
                            <Input value={formData.phoneNumber || ""} onChange={(e) => { setFormData({ ...formData, phoneNumber: e.target.value }); setFieldErrors(p => ({ ...p, phoneNumber: "" })); }} className={fieldErrors.phoneNumber ? "border-destructive" : ""} />
                            {fieldErrors.phoneNumber && <p className="text-xs text-destructive">{fieldErrors.phoneNumber}</p>}
                          </div>
                        ) : u.phoneNumber}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="space-y-1">
                            <Select
                              value={formData.role}
                              onChange={(e) => { setFormData({ ...formData, role: e.target.value as Role }); setFieldErrors(p => ({ ...p, role: "" })); }}
                              options={[
                                ...(currentUser?.role === Role.super_admin ? [{ value: Role.admin, label: "Admin" }] : []),
                                { value: Role.pms_offcier, label: "PMS Officer" },
                                { value: Role.epayment_officer, label: "E-Payment Officer" }
                              ]}
                            />
                            {fieldErrors.role && <p className="text-xs text-destructive">{fieldErrors.role}</p>}
                          </div>
                        ) : (
                          <Badge variant={u.role === Role.admin ? "default" : "secondary"}>
                            {u.role.replace("_", " ")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="space-y-1">
                            <Input
                              type="password"
                              value={formData.password || ""}
                              onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setFieldErrors(p => ({ ...p, password: "" })); }}
                              placeholder="New password"
                              className={fieldErrors.password ? "border-destructive" : ""}
                            />
                            {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
                          </div>
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
