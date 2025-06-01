'use client';

import { useEffect, useState } from "react";
import { UserManagement } from "./user-management";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth-server";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditLogs } from "./audit-logs";
import { Button } from "@/components/ui/button";

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

export default function AdminDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            console.log('[AdminDashboard] Fetching users...');

            const response = await fetch('/api/admin/users');
            console.log('[AdminDashboard] Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[AdminDashboard] Error response:', errorText);
                throw new Error(`Failed to load users: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            console.log('[AdminDashboard] Received users:', data.users);

            if (!data.users || !Array.isArray(data.users)) {
                console.error('[AdminDashboard] Invalid users data:', data);
                throw new Error('Invalid users data received from server');
            }

            setUsers(data.users);
        } catch (err) {
            console.error('[AdminDashboard] Error loading users:', err);
            setError(err instanceof Error ? err.message : 'Failed to load users. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log('[AdminDashboard] Component mounted, loading users...');
        loadUsers();
    }, []);

    const handleUserUpdate = () => {
        console.log('[AdminDashboard] User update triggered, reloading users...');
        loadUsers();
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <h2 className="text-xl font-semibold mb-2">Error</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadUsers}>
                    Try Again
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage users and system settings
                    </p>
                </div>
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Overview</CardTitle>
                            <CardDescription>
                                Key metrics and system status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <Skeleton className="h-[100px]" />
                                <Skeleton className="h-[100px]" />
                                <Skeleton className="h-[100px]" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>
                                Loading user data...
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Manage users and system settings
                </p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>System Overview</CardTitle>
                        <CardDescription>
                            Key metrics and system status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="p-4 border rounded-lg">
                                <h3 className="text-sm font-medium">Total Users</h3>
                                <p className="text-2xl font-bold mt-2">{users.length}</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <h3 className="text-sm font-medium">Administrators</h3>
                                <p className="text-2xl font-bold mt-2">
                                    {users.filter(u => u.role === Role.ADMIN).length}
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <h3 className="text-sm font-medium">Staff Members</h3>
                                <p className="text-2xl font-bold mt-2">
                                    {users.filter(u => u.role === Role.STAFF).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {(() => {
                    console.log('[AdminDashboard] Rendering UserManagement with users:', users);
                    return <UserManagement initialUsers={users} onUserUpdate={handleUserUpdate} />;
                })()}

                <AuditLogs />
            </div>
        </div>
    );
} 