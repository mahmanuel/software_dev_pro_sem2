"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { StatusType } from "@prisma/client"

// Only admins can access analytics
async function checkAdminAccess() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("You must be logged in")
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Only administrators can access analytics")
  }
}

// Get issue count by status
export async function getIssueCountByStatus() {
  try {
    await checkAdminAccess()

    // Get the latest status for each issue
    const issueStatuses = await prisma.$queryRaw`
      WITH latest_statuses AS (
        SELECT DISTINCT ON ("issueId") 
          "issueId", 
          "status",
          "createdAt"
        FROM "issue_statuses"
        ORDER BY "issueId", "createdAt" DESC
      )
      SELECT "status", COUNT(*) as "count"
      FROM latest_statuses
      GROUP BY "status"
      ORDER BY "count" DESC
    `

    return issueStatuses
  } catch (error) {
    console.error("Error fetching issue count by status:", error)
    throw new Error("Failed to fetch analytics")
  }
}

// Get issue count by category
export async function getIssueCountByCategory() {
  try {
    await checkAdminAccess()

    const categories = await prisma.issue.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    })

    return categories.map((c) => ({
      category: c.category,
      count: c._count.id,
    }))
  } catch (error) {
    console.error("Error fetching issue count by category:", error)
    throw new Error("Failed to fetch analytics")
  }
}

// Get average resolution time
export async function getAverageResolutionTime() {
  try {
    await checkAdminAccess()

    // Find issues that have been resolved
    const resolvedIssues = await prisma.issue.findMany({
      where: {
        statuses: {
          some: {
            status: StatusType.RESOLVED,
          },
        },
      },
      include: {
        statuses: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    if (resolvedIssues.length === 0) {
      return { averageTimeInHours: 0, totalResolved: 0 }
    }

    // Calculate resolution time for each issue
    let totalTimeInMs = 0

    for (const issue of resolvedIssues) {
      const submittedStatus = issue.statuses.find((s) => s.status === StatusType.SUBMITTED)
      const resolvedStatus = issue.statuses.find((s) => s.status === StatusType.RESOLVED)

      if (submittedStatus && resolvedStatus) {
        const submittedTime = new Date(submittedStatus.createdAt).getTime()
        const resolvedTime = new Date(resolvedStatus.createdAt).getTime()
        totalTimeInMs += resolvedTime - submittedTime
      }
    }

    const averageTimeInHours = totalTimeInMs / resolvedIssues.length / (1000 * 60 * 60)

    return {
      averageTimeInHours: Math.round(averageTimeInHours * 10) / 10, // Round to 1 decimal place
      totalResolved: resolvedIssues.length,
    }
  } catch (error) {
    console.error("Error calculating average resolution time:", error)
    throw new Error("Failed to fetch analytics")
  }
}

// Get faculty performance metrics
export async function getFacultyPerformanceMetrics() {
  try {
    await checkAdminAccess()

    // Get all faculty members
    const facultyMembers = await prisma.user.findMany({
      where: { role: "FACULTY" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    const metrics = []

    for (const faculty of facultyMembers) {
      // Get assigned issues
      const assignedIssues = await prisma.issue.count({
        where: { assignedToId: faculty.id },
      })

      // Get resolved issues
      const resolvedIssues = await prisma.issue.count({
        where: {
          assignedToId: faculty.id,
          statuses: {
            some: {
              status: StatusType.RESOLVED,
            },
          },
        },
      })

      // Calculate average resolution time
      const issues = await prisma.issue.findMany({
        where: {
          assignedToId: faculty.id,
          statuses: {
            some: {
              status: StatusType.RESOLVED,
            },
          },
        },
        include: {
          statuses: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      })

      let totalTimeInMs = 0

      for (const issue of issues) {
        const assignedStatus = issue.statuses.find((s) => s.status === StatusType.ASSIGNED)
        const resolvedStatus = issue.statuses.find((s) => s.status === StatusType.RESOLVED)

        if (assignedStatus && resolvedStatus) {
          const assignedTime = new Date(assignedStatus.createdAt).getTime()
          const resolvedTime = new Date(resolvedStatus.createdAt).getTime()
          totalTimeInMs += resolvedTime - assignedTime
        }
      }

      const averageTimeInHours = issues.length > 0 ? totalTimeInMs / issues.length / (1000 * 60 * 60) : 0
      
      metrics.push({
        faculty: {
          id: faculty.id,
          name: faculty.name,
          email: faculty.email,
        },
        assignedIssues,
        resolvedIssues,
        resolutionRate: assignedIssues > 0 ? (resolvedIssues / assignedIssues) * 100 : 0,
        averageResolutionTimeInHours: Math.round(averageTimeInHours * 10) / 10,
      })
    }
    return metrics
  } catch (error) {
    console.error("Error fetching faculty performance metrics:", error)
    throw new Error("Failed to fetch analytics")
  }
}

// Get issue trends over time
export async function getIssueTrendsOverTime(period: "week" | "month" | "year" = "month") {
  try {
    await checkAdminAccess()

    let dateFormat: string
    let intervalDays: number

    switch (period) {
      case "week":
        dateFormat = "YYYY-MM-DD"
        intervalDays = 1
        break
      case "month":
        dateFormat = "YYYY-MM-DD"
        intervalDays = 1
        break
      case "year":
        dateFormat = "YYYY-MM"
        intervalDays = 30
        break
      default:
        dateFormat = "YYYY-MM-DD"
        intervalDays = 1
    }

    // Get start date based on period
    const startDate = new Date()
    if (period === "week") {
      startDate.setDate(startDate.getDate() - 7)
    } else if (period === "month") {
      startDate.setDate(startDate.getDate() - 30)
    } else {
      startDate.setDate(startDate.getDate() - 365)
    }

    // Get issues created in the period
    const issues = await prisma.issue.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        createdAt: true,
        statuses: {
          select: {
            status: true,
            createdAt: true,
          },
        },
      },
    })

    // Group by date
    const dateGroups: Record<string, { created: number; resolved: number }> = {}

    // Initialize all dates in the range
    const currentDate = new Date(startDate)
    const endDate = new Date()

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split("T")[0]
      dateGroups[dateKey] = { created: 0, resolved: 0 }
      currentDate.setDate(currentDate.getDate() + intervalDays)
    }

    // Count issues
    for (const issue of issues) {
      const createdDate = issue.createdAt.toISOString().split("T")[0]

      if (dateGroups[createdDate]) {
        dateGroups[createdDate].created += 1
      }

      // Check if issue was resolved
      const resolvedStatus = issue.statuses.find((s) => s.status === StatusType.RESOLVED)
      if (resolvedStatus) {
        const resolvedDate = resolvedStatus.createdAt.toISOString().split("T")[0]
        if (dateGroups[resolvedDate]) {
          dateGroups[resolvedDate].resolved += 1
        }
      }
    }

    // Convert to array for easier consumption by charts
    const result = Object.entries(dateGroups).map(([date, counts]) => ({
      date,
      created: counts.created,
      resolved: counts.resolved,
    }))

    return result.sort((a, b) => a.date.localeCompare(b.date))
  } catch (error) {
    console.error("Error fetching issue trends:", error)
    throw new Error("Failed to fetch analytics")
  }
}

