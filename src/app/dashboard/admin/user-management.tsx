"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedAdminCard } from "@/components/ui/animated";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { MoreVerticalIcon, MailIcon, CalendarIcon, ShieldIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
    id: string;
    name: string | null;
    email: string;
    role: Role;
    createdAt: Date;
    _count: {
        events: number;
    };
}

interface UserManagementProps {
    initialUsers: User[];
    onUserUpdate: () => void;
}

export function UserManagement({ initialUsers, onUserUpdate }: UserManagementProps) {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newRole, setNewRole] = useState<Role | null>(null);

    console.log('[UserManagement] Initial users:', initialUsers);
    console.log('[UserManagement] Current users state:', users);

    const updateUserRole = async (userId: string, role: Role) => {
        try {
            setIsLoading(true);
            console.log('[UserManagement] Updating role for user:', userId, 'to:', role);
            const response = await fetch("/api/admin/users/update-role", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId, role }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('[UserManagement] Role update failed:', errorData);
                throw new Error("Failed to update user role");
            }

            // Update local state
            setUsers(users.map(user =>
                user.id === userId ? { ...user, role } : user
            ));

            toast.success("User role updated successfully");
            onUserUpdate();
            router.refresh();
        } catch (error) {
            console.error("[UserManagement] Error updating role:", error);
            toast.error("Failed to update user role");
        } finally {
            setIsLoading(false);
            setIsDialogOpen(false);
        }
    };

    const handleRoleChange = (user: User) => {
        console.log('[UserManagement] Opening role change dialog for user:', user);
        setSelectedUser(user);
        setNewRole(user.role);
        setIsDialogOpen(true);
    };

    if (!users || users.length === 0) {
        return (
            <AnimatedAdminCard>
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>
                            No users found. Please check your permissions or try refreshing the page.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </AnimatedAdminCard>
        );
    }

    return (
        <AnimatedAdminCard>
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                        Manage user roles and permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Events</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user, index) => (
                                <AnimatedAdminCard key={user.id} index={index}>
                                    <TableRow>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {user.name || "Unnamed User"}
                                                </span>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <MailIcon className="h-3 w-3" />
                                                    <span>{user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "border-transparent",
                                                    user.role === Role.ADMIN && "bg-red-500/10 text-red-500",
                                                    user.role === Role.STAFF && "bg-blue-500/10 text-blue-500",
                                                    user.role === Role.EVENT_OWNER && "bg-green-500/10 text-green-500"
                                                )}
                                            >
                                                {user.role.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user._count.events}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <CalendarIcon className="h-3 w-3" />
                                                {format(new Date(user.createdAt), "MMM d, yyyy")}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={isLoading}
                                                        className="h-8 w-8"
                                                    >
                                                        <MoreVerticalIcon className="h-4 w-4" />
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => handleRoleChange(user)}
                                                        disabled={isLoading}
                                                    >
                                                        <ShieldIcon className="mr-2 h-4 w-4" />
                                                        Change Role
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                </AnimatedAdminCard>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Role Change Dialog */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Change User Role</DialogTitle>
                                <DialogDescription>
                                    Update the role for {selectedUser?.name || selectedUser?.email}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={newRole || undefined}
                                        onValueChange={(value) => setNewRole(value as Role)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={Role.ADMIN}>Administrator</SelectItem>
                                            <SelectItem value={Role.STAFF}>Staff Member</SelectItem>
                                            <SelectItem value={Role.EVENT_OWNER}>Event Owner</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => selectedUser && newRole && updateUserRole(selectedUser.id, newRole)}
                                    disabled={isLoading || !newRole || !selectedUser || newRole === selectedUser.role}
                                >
                                    {isLoading ? "Updating..." : "Update Role"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </AnimatedAdminCard>
    );
} 