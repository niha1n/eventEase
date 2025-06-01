import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import {
  subDays,
  format,
  startOfDay,
  endOfDay,
  isAfter,
  isBefore,
  isWithinInterval,
} from "date-fns";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = user.user.id;
    const now = new Date();

    // Get user with role
    const userWithRole = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
      },
    });

    if (!userWithRole) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get all user's events with necessary data
    const userEvents = await prisma.event.findMany({
      where: {
        userId: userId,
      },
      include: {
        _count: {
          select: {
            rsvps: true,
            views: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    // Categorize events
    const categorizedEvents = userEvents.reduce(
      (acc, event) => {
        const startDate = new Date(event.startDate);
        const endDate = event.endDate ? new Date(event.endDate) : null;

        // Determine event status
        let status: "past" | "ongoing" | "upcoming";
        if (endDate && isBefore(endDate, now)) {
          status = "past";
        } else if (startDate && isAfter(startDate, now)) {
          status = "upcoming";
        } else {
          status = "ongoing";
        }

        // Add event to appropriate category
        acc[status].push({
          ...event,
          status,
          daysUntilStart: Math.ceil(
            (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          ),
          daysSinceEnd: endDate
            ? Math.ceil(
                (now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)
              )
            : null,
        });

        return acc;
      },
      {
        past: [] as any[],
        ongoing: [] as any[],
        upcoming: [] as any[],
      }
    );

    // Sort events within each category
    categorizedEvents.past.sort(
      (a, b) => (b.endDate?.getTime() || 0) - (a.endDate?.getTime() || 0)
    );
    categorizedEvents.ongoing.sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime()
    );
    categorizedEvents.upcoming.sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );

    // Get recent events (last 5 from past and ongoing)
    const recentEvents = [
      ...categorizedEvents.past,
      ...categorizedEvents.ongoing,
    ]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);

    // Get upcoming events (next 5)
    const upcomingEvents = categorizedEvents.upcoming.slice(0, 5);

    // Get total events count
    const totalEvents = userEvents.length;

    // Get published events count
    const publishedEvents = userEvents.filter(
      (event) => event.isPublished
    ).length;

    // Get total RSVPs
    const totalRSVPs = await prisma.rSVP.count({
      where: {
        event: {
          userId: userId,
        },
      },
    });

    // Get analytics data
    const thirtyDaysAgo = subDays(now, 30);

    // Get RSVP trends
    const rsvpTrends = await prisma.rSVP.groupBy({
      by: ["createdAt", "status"],
      where: {
        event: {
          userId: userId,
        },
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
    });

    // Get view trends
    const viewTrends = await prisma.eventView.groupBy({
      by: ["createdAt"],
      where: {
        event: {
          userId: userId,
        },
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
    });

    // Process RSVP trends data
    const processedRSVPTrends = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(now, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayRSVPs = rsvpTrends.filter(
        (r) => format(new Date(r.createdAt), "yyyy-MM-dd") === dateStr
      );

      return {
        date: dateStr,
        confirmed: dayRSVPs.find((r) => r.status === "CONFIRMED")?._count || 0,
        pending: dayRSVPs.find((r) => r.status === "PENDING")?._count || 0,
        declined: dayRSVPs.find((r) => r.status === "DECLINED")?._count || 0,
        total: dayRSVPs.reduce((sum, r) => sum + r._count, 0),
      };
    }).reverse();

    // Process view trends data
    const processedViewTrends = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(now, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayViews = viewTrends.filter(
        (v) => format(new Date(v.createdAt), "yyyy-MM-dd") === dateStr
      );

      return {
        date: dateStr,
        views: dayViews.reduce((sum, v) => sum + v._count, 0),
      };
    }).reverse();

    // Calculate event stats
    const eventStats = userEvents.map((event) => {
      const views = event._count.views;
      const rsvps = event._count.rsvps;
      const conversionRate = views > 0 ? Math.round((rsvps / views) * 100) : 0;

      return {
        id: event.id,
        title: event.title,
        views,
        rsvps,
        conversionRate,
      };
    });

    // Calculate total analytics
    const totalViews = userEvents.reduce(
      (sum, event) => sum + event._count.views,
      0
    );
    const totalRSVPsCount = userEvents.reduce(
      (sum, event) => sum + event._count.rsvps,
      0
    );
    const conversionRate =
      totalViews > 0 ? Math.round((totalRSVPsCount / totalViews) * 100) : 0;
    const activeEvents = categorizedEvents.ongoing.length;

    return NextResponse.json({
      userWithRole,
      recentEvents,
      upcomingEvents,
      categorizedEvents,
      totalEvents,
      publishedEvents,
      totalRSVPs,
      analytics: {
        totalViews,
        totalRSVPs: totalRSVPsCount,
        conversionRate,
        activeEvents,
        rsvpTrends: processedRSVPTrends,
        viewTrends: processedViewTrends,
        eventStats,
      },
    });
  } catch (error) {
    console.error("[DASHBOARD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
