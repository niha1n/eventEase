"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Eye, TrendingUp, Calendar, BarChart as BarChartIcon } from "lucide-react";
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
    Legend,
} from "recharts";

interface DashboardAnalyticsProps {
    analyticsData: {
        totalViews: number;
        totalRSVPs: number;
        conversionRate: number;
        activeEvents: number;
        rsvpTrends: Array<{
            date: string;
            confirmed: number;
            pending: number;
            declined: number;
            total: number;
        }>;
        viewTrends: Array<{
            date: string;
            views: number;
        }>;
        eventStats: Array<{
            id: string;
            title: string;
            views: number;
            rsvps: number;
            conversionRate: number;
        }>;
    };
}

export default function DashboardAnalytics({ analyticsData }: DashboardAnalyticsProps) {
    const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("30d");

    // Filter data based on time range
    const filterDataByTimeRange = (data: any[]) => {
        const now = new Date();
        const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
        const startDate = new Date(now.setDate(now.getDate() - daysAgo));
        return data.filter(item => new Date(item.date) >= startDate);
    };

    const rsvpData = filterDataByTimeRange(analyticsData.rsvpTrends);
    const viewData = filterDataByTimeRange(analyticsData.viewTrends);

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Analytics Overview</h2>
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
                        <div className="text-2xl font-bold">{analyticsData.totalViews}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all events
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total RSVPs</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.totalRSVPs}</div>
                        <p className="text-xs text-muted-foreground">
                            Total registrations
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.conversionRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            Views to RSVPs
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.activeEvents}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently active
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
                                    <Legend />
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
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="views"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                        name="Page Views"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Event Performance Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Event Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3">Event</th>
                                    <th className="px-4 py-3">Views</th>
                                    <th className="px-4 py-3">RSVPs</th>
                                    <th className="px-4 py-3">Conversion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analyticsData.eventStats.map((event) => (
                                    <tr key={event.id} className="border-b">
                                        <td className="px-4 py-3 font-medium">{event.title}</td>
                                        <td className="px-4 py-3">{event.views}</td>
                                        <td className="px-4 py-3">{event.rsvps}</td>
                                        <td className="px-4 py-3">{event.conversionRate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 