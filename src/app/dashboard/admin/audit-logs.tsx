import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Role } from "@prisma/client";
import { AnimatedAdminCard } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AuditLogDetails {
    newRole?: Role;
    previousRole?: Role;
    [key: string]: any;
}

interface AuditLog {
    id: string;
    action: string;
    details: AuditLogDetails | string;
    createdAt: Date;
    user: {
        name: string | null;
        email: string;
    };
    targetUser: {
        name: string | null;
        email: string;
    } | null;
}

function formatAuditLogDetails(details: AuditLogDetails | string): string {
    if (typeof details === 'string') {
        return details;
    }

    // Handle role changes
    if (details.newRole !== undefined && details.previousRole !== undefined) {
        return `Role changed from ${details.previousRole} to ${details.newRole}`;
    }

    // Handle other types of details
    return Object.entries(details)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
}

function getActionBadgeVariant(action: string): string {
    switch (action.toLowerCase()) {
        case 'create':
            return 'bg-green-500/10 text-green-500';
        case 'update':
            return 'bg-blue-500/10 text-blue-500';
        case 'delete':
            return 'bg-red-500/10 text-red-500';
        default:
            return 'bg-gray-500/10 text-gray-500';
    }
}

export function AuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/admin/audit-logs');
                if (!response.ok) {
                    throw new Error('Failed to fetch audit logs');
                }
                const data = await response.json();
                setLogs(data.auditLogs);
            } catch (err) {
                console.error('Error fetching audit logs:', err);
                setError('Failed to load audit logs. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, []);

    if (error) {
        return (
            <AnimatedAdminCard className="text-center py-4">
                <p className="text-destructive">{error}</p>
            </AnimatedAdminCard>
        );
    }

    return (
        <AnimatedAdminCard>
            <Card>
                <CardHeader>
                    <CardTitle>Audit Logs</CardTitle>
                    <CardDescription>
                        Recent system activities and user actions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">Time</TableHead>
                                    <TableHead className="w-[200px]">User</TableHead>
                                    <TableHead className="w-[150px]">Action</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead className="w-[200px]">Target User</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    // Loading skeletons
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No audit logs found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log, index) => (
                                        <TableRow key={log.id} className="group">
                                            <TableCell className="whitespace-nowrap text-muted-foreground">
                                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {log.user.name || "Unnamed User"}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {log.user.email}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "border-transparent",
                                                        getActionBadgeVariant(log.action)
                                                    )}
                                                >
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-md">
                                                <div className="truncate group-hover:text-clip">
                                                    {formatAuditLogDetails(log.details)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {log.targetUser ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {log.targetUser.name || "Unnamed User"}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {log.targetUser.email}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </AnimatedAdminCard>
    );
} 