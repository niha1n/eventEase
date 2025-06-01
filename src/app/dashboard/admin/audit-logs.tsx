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
            <div className="text-center py-4">
                <p className="text-destructive">{error}</p>
            </div>
        );
    }

    return (
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
                                <TableHead>Time</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Target User</TableHead>
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
                                    <TableCell colSpan={5} className="text-center py-4">
                                        No audit logs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell>
                                            {log.user.name || log.user.email}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {log.action}
                                        </TableCell>
                                        <TableCell className="max-w-md truncate">
                                            {formatAuditLogDetails(log.details)}
                                        </TableCell>
                                        <TableCell>
                                            {log.targetUser ? (log.targetUser.name || log.targetUser.email) : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
} 