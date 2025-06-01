"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Eye, MousePointerClick, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { RSVPStatus } from "@prisma/client";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";

interface EventAnalyticsProps {
    eventId: string;
    eventData: {
        title: string;
        startDate: Date;
        endDate?: Date | null;
        _count: {
            rsvps: number;
            views: number;
        };
        rsvps: Array<{
            createdAt: Date;
            status: RSVPStatus;
        }>;
        views: Array<{
            createdAt: Date;
            source: string;
        }>;
    };
}


export default function EventAnalytics({ eventId, eventData }: EventAnalyticsProps) {
    const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("30d");

    // Process data for charts
    const processRSVPData = () => {
        const now = new Date();
        const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
        const startDate = new Date(now.setDate(now.getDate() - daysAgo));

        const rsvpData = eventData.rsvps
            .filter(rsvp => new Date(rsvp.createdAt) >= startDate)
            .reduce((acc: any[], rsvp) => {
                const date = format(new Date(rsvp.createdAt), "MMM dd");
                const existing = acc.find(item => item.date === date);
                if (existing) {
                    existing[rsvp.status.toLowerCase()]++;
                    existing.total++;
                } else {
                    acc.push({
                        date,
                        confirmed: rsvp.status === RSVPStatus.CONFIRMED ? 1 : 0,
                        declined: rsvp.status === RSVPStatus.DECLINED ? 1 : 0,
                        pending: rsvp.status === RSVPStatus.PENDING ? 1 : 0,
                        total: 1,
                    });
                }
                return acc;
            }, []);

        return rsvpData.sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    };

    const processViewData = () => {
        const now = new Date();
        const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
        const startDate = new Date(now.setDate(now.getDate() - daysAgo));

        const viewData = eventData.views
            .filter(view => new Date(view.createdAt) >= startDate)
            .reduce((acc: any[], view) => {
                const date = format(new Date(view.createdAt), "MMM dd");
                const existing = acc.find(item => item.date === date);
                if (existing) {
                    existing.views++;
                } else {
                    acc.push({ date, views: 1 });
                }
                return acc;
            }, []);

        return viewData.sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    };

    const rsvpData = processRSVPData();
    const viewData = processViewData();

    // Calculate summary metrics
    const totalRSVPs = eventData._count.rsvps;
    const confirmedRSVPs = eventData.rsvps.filter(r => r.status === RSVPStatus.CONFIRMED).length;
    const pendingRSVPs = eventData.rsvps.filter(r => r.status === RSVPStatus.PENDING).length;
    const totalViews = eventData._count.views;
    const conversionRate = totalViews > 0 ? ((confirmedRSVPs / totalViews) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Event Analytics</h2>
                <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
                    <TabsList>
                        <TabsTrigger value="7d">Last 7 days</TabsTrigger>
                        <TabsTrigger value="30d">Last 30 days</TabsTrigger>
                        <TabsTrigger value="all">All time</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalViews}</div>
                        <p className="text-xs text-muted-foreground">
                            Unique page views
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total RSVPs</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRSVPs}</div>
                        <p className="text-xs text-muted-foreground">
                            {confirmedRSVPs} confirmed, {pendingRSVPs} pending
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{conversionRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            Views to confirmed RSVPs
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Event Status</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Date() > new Date(eventData.endDate || eventData.startDate) ? "Ended" : "Active"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {format(new Date(eventData.startDate), "MMM d, yyyy")}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* RSVP Trends */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>RSVP Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={rsvpData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="confirmed" stackId="a" fill="#22c55e" name="Confirmed" />
                                    <Bar dataKey="pending" stackId="a" fill="#eab308" name="Pending" />
                                    <Bar dataKey="declined" stackId="a" fill="#ef4444" name="Declined" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* View Trends */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>View Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={viewData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="views"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 