"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search } from "lucide-react";
import { CustomField } from "@/types/event";
import { getEventRSVPs, exportRSVPsAsCSV } from "@/lib/rsvp-actions";
import { toast } from "sonner";

type AttendeeListProps = {
    eventId: string;
    customFields: CustomField[];
};

export default function AttendeeList({ eventId, customFields }: AttendeeListProps) {
    const [rsvps, setRsvps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const fetchRSVPs = async () => {
            setLoading(true);
            try {
                const result = await getEventRSVPs(eventId);
                if (result.success && result.data) {
                    setRsvps(result.data);
                } else {
                    toast.error("Failed to load attendees");
                    setRsvps([]);
                }
            } catch (error) {
                toast.error("An error occurred while loading attendees");
                setRsvps([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRSVPs();
    }, [eventId]);

    // Handle exporting attendees as CSV
    const handleExport = async () => {
        setExporting(true);
        try {
            const result = await exportRSVPsAsCSV(eventId);

            if (result.success && result.data) {
                // Create a blob from the CSV content
                const blob = new Blob([result.data.content], { type: "text/csv" });
                const url = URL.createObjectURL(blob);

                // Create a temporary link and trigger download
                const a = document.createElement("a");
                a.href = url;
                a.download = result.data.filename;
                document.body.appendChild(a);
                a.click();

                // Clean up
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                toast.success("Attendee list exported successfully");
            } else {
                toast.error(result.error as string || "Failed to export attendees");
            }
        } catch (error) {
            toast.error("An error occurred while exporting attendees");
        } finally {
            setExporting(false);
        }
    };

    // Filter RSVPs based on search term
    const filteredRSVPs = rsvps.filter(
        (rsvp) =>
            rsvp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rsvp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="text-center p-8">
                <p>Loading attendees...</p>
            </div>
        );
    }

    if (rsvps.length === 0) {
        return (
            <div className="text-center p-8 bg-muted/50 rounded-lg">
                <h3 className="text-lg font-medium mb-2">No Attendees Yet</h3>
                <p className="text-muted-foreground">
                    When people RSVP to your event, they will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search attendees..."
                        className="pl-8 w-full sm:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Button
                    variant="outline"
                    onClick={handleExport}
                    disabled={exporting || rsvps.length === 0}
                >
                    <Download className="mr-2 h-4 w-4" />
                    {exporting ? "Exporting..." : "Export CSV"}
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Registration Date</TableHead>
                            {customFields.map((field) => (
                                <TableHead key={field.id}>{field.label}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRSVPs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4 + customFields.length} className="text-center">
                                    No matching attendees found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRSVPs.map((rsvp) => (
                                <TableRow key={rsvp.id}>
                                    <TableCell className="font-medium">{rsvp.name}</TableCell>
                                    <TableCell>{rsvp.email}</TableCell>
                                    <TableCell>{rsvp.phone || "-"}</TableCell>
                                    <TableCell>
                                        {new Date(rsvp.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    {customFields.map((field) => {
                                        const responses = rsvp.responses || {};
                                        const value = responses[field.id];

                                        return (
                                            <TableCell key={`${rsvp.id}-${field.id}`}>
                                                {value === undefined
                                                    ? "-"
                                                    : field.type === "checkbox"
                                                        ? value
                                                            ? "Yes"
                                                            : "No"
                                                        : field.type === "date" && value
                                                            ? new Date(value).toLocaleDateString()
                                                            : String(value || "-")}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="text-sm text-muted-foreground">
                Total Attendees: {rsvps.length}
                {searchTerm && ` (Filtered: ${filteredRSVPs.length})`}
            </div>
        </div>
    );
}