"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Category, Priority, StatusType } from "@prisma/client"
import { createNotification } from "./notifications"

// Schema for issue creation
const createIssueSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum([
    Category.GRADE_DISPUTE,
    Category.CLASS_SCHEDULE,
    Category.FACULTY_CONCERN,
    Category.COURSE_REGISTRATION,
    Category.GRADUATION_REQUIREMENT,
    Category.OTHER,
  ]),
  priority: z.enum([Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.URGENT]).default(Priority.MEDIUM),
})

// Create a new issue
export async function createIssue(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return { error: "You must be logged in to create an issue" }
    }

    const validatedFields = createIssueSchema.parse({
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      priority: formData.get("priority") || Priority.MEDIUM,
    })

    const { title, description, category, priority } = validatedFields

    // Create the issue
    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        category,
        priority,
        submittedById: session.user.id,
        statuses: {
          create: {
            status: StatusType.SUBMITTED,
            updatedById: session.user.id,
          },
        },
      },
      include: {
        submittedBy: true,
      },
    })

    // Create notification for admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
    })

    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: "ISSUE_CREATED",
        message: `New issue "${title}" has been submitted by ${session.user.name || session.user.email}`,
      })
    }

    revalidatePath("/issues")
    return { success: "Issue created successfully", issueId: issue.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }

    return { error: "Something went wrong. Please try again." }
  }
}

// Assign an issue to a faculty member
export async function assignIssue(issueId: string, facultyId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return { error: "You must be logged in to assign an issue" }
    }

    if (session.user.role !== "ADMIN") {
      return { error: "Only administrators can assign issues" }
    }

    // Get the faculty member
    const faculty = await prisma.user.findFirst({
      where: {
        id: facultyId,
        role: "FACULTY",
      },
    })

    if (!faculty) {
      return { error: "Faculty member not found" }
    }

    // Update the issue
    const issue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        assignedToId: facultyId,
        statuses: {
          create: {
            status: StatusType.ASSIGNED,
            updatedById: session.user.id,
            notes: `Assigned to ${faculty.name || faculty.email}`,
          },
        },
      },
      include: {
        submittedBy: true,
      },
    })

    // Create notifications
    await createNotification({
      userId: facultyId,
      type: "ISSUE_ASSIGNED",
      message: `You have been assigned to issue "${issue.title}"`,
    })

    await createNotification({
      userId: issue.submittedBy.id,
      type: "STATUS_UPDATED",
      message: `Your issue "${issue.title}" has been assigned to a faculty member`,
    })

    revalidatePath(`/issues/${issueId}`)
    revalidatePath("/issues")
    return { success: "Issue assigned successfully" }
  } catch (error) {
    return { error: "Something went wrong. Please try again." }
  }
}

// Update issue status
export async function updateIssueStatus(issueId: string, status: StatusType, notes?: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return { error: "You must be logged in to update an issue" }
    }

    // Check permissions
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        submittedBy: true,
        assignedTo: true,
      },
    })

    if (!issue) {
      return { error: "Issue not found" }
    }

    // Only assigned faculty, admin, or the submitter (in some cases) can update status
    const isAdmin = session.user.role === "ADMIN"
    const isAssignedFaculty = issue.assignedToId === session.user.id
    const isSubmitter = issue.submittedById === session.user.id

    if (!isAdmin && !isAssignedFaculty && !(isSubmitter && status === StatusType.CLOSED)) {
      return { error: "You don't have permission to update this issue" }
    }

    // Update the issue status
    await prisma.issueStatus.create({
      data: {
        issueId,
        status,
        notes,
        updatedById: session.user.id,
      },
    })

    // Create notification for the submitter
    await createNotification({
      userId: issue.submittedBy.id,
      type: "STATUS_UPDATED",
      message: `Your issue "${issue.title}" status has been updated to ${status}`,
    })

    // If there's an assigned faculty and the updater is not them, notify them too
    if (issue.assignedToId && issue.assignedToId !== session.user.id) {
      await createNotification({
        userId: issue.assignedToId,
        type: "STATUS_UPDATED",
        message: `Issue "${issue.title}" status has been updated to ${status}`,
      })
    }

    revalidatePath(`/issues/${issueId}`)
    revalidatePath("/issues")
    return { success: "Issue status updated successfully" }
  } catch (error) {
    return { error: "Something went wrong. Please try again." }
  }
}

// Escalate an issue
export async function escalateIssue(issueId: string, reason: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return { error: "You must be logged in to escalate an issue" }
    }

    // Only faculty or admin can escalate
    if (session.user.role !== "FACULTY" && session.user.role !== "ADMIN") {
      return { error: "Only faculty or administrators can escalate issues" }
    }

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        submittedBy: true,
      },
    })

    if (!issue) {
      return { error: "Issue not found" }
    }

    // Update the issue status
    await prisma.issueStatus.create({
      data: {
        issueId,
        status: StatusType.ESCALATED,
        notes: reason,
        updatedById: session.user.id,
      },
    })

    // Notify all admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
    })

    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: "ISSUE_ESCALATED",
        message: `Issue "${issue.title}" has been escalated: ${reason}`,
      })
    }

    // Notify the submitter
    await createNotification({
      userId: issue.submittedBy.id,
      type: "STATUS_UPDATED",
      message: `Your issue "${issue.title}" has been escalated for further review`,
    })

    revalidatePath(`/issues/${issueId}`)
    revalidatePath("/issues")
    return { success: "Issue escalated successfully" }
  } catch (error) {
    return { error: "Something went wrong. Please try again." }
  }
}

// Add a comment to an issue
export async function addComment(issueId: string, content: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return { error: "You must be logged in to comment" }
    }

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        submittedBy: true,
        assignedTo: true,
      },
    })

    if (!issue) {
      return { error: "Issue not found" }
    }

    // Create the comment
    await prisma.comment.create({
      data: {
        content,
        issueId,
        userId: session.user.id,
      },
    })

    // Notify relevant parties
    const notifyUsers = new Set<string>()

    // Always notify the submitter unless they made the comment
    if (issue.submittedById !== session.user.id) {
      notifyUsers.add(issue.submittedById)
    }

    // Notify assigned faculty if they didn't make the comment
    if (issue.assignedToId && issue.assignedToId !== session.user.id) {
      notifyUsers.add(issue.assignedToId)
    }

    for (const userId of notifyUsers) {
      await createNotification({
        userId,
        type: "COMMENT_ADDED",
        message: `New comment on issue "${issue.title}"`,
      })
    }

    revalidatePath(`/issues/${issueId}`)
    return { success: "Comment added successfully" }
  } catch (error) {
    return { error: "Something went wrong. Please try again." }
  }
}

// Get issues with filtering
export async function getIssues({
  status,
  category,
  priority,
  search,
  assignedToId,
  submittedById,
  page = 1,
  limit = 10,
}: {
  status?: StatusType
  category?: Category
  priority?: Priority
  search?: string
  assignedToId?: string
  submittedById?: string
  page?: number
  limit?: number
}) {
  try {
    const skip = (page - 1) * limit

    // Build the where clause
    const where: any = {}

    if (status) {
      where.statuses = {
        some: {
          status,
          id: {
            in: prisma.issueStatus
              .findMany({
                where: { status },
                distinct: ["issueId"],
                orderBy: { createdAt: "desc" },
                select: { id: true },
              })
              .then((statuses) => statuses.map((s) => s.id)),
          },
        },
      }
    }

    if (category) {
      where.category = category
    }

    if (priority) {
      where.priority = priority
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (assignedToId) {
      where.assignedToId = assignedToId
    }

    if (submittedById) {
      where.submittedById = submittedById
    }

    // Get total count for pagination
    const total = await prisma.issue.count({ where })

    // Get the issues
    const issues = await prisma.issue.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        statuses: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            updatedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return {
      issues,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    }
  } catch (error) {
    console.error("Error fetching issues:", error)
    throw new Error("Failed to fetch issues")
  }
}

// Get a single issue with all details
export async function getIssueDetails(issueId: string) {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        statuses: {
          orderBy: { createdAt: "desc" },
          include: {
            updatedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
              },
            },
          },
        },
        attachments: true,
      },
    })

    if (!issue) {
      throw new Error("Issue not found")
    }

    return issue
  } catch (error) {
    console.error("Error fetching issue details:", error)
    throw new Error("Failed to fetch issue details")
  }
}

