"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sendEmail, emailTemplates } from "@/lib/email"
import type { StatusType } from "@prisma/client"

// Send issue created notification
export async function sendIssueCreatedNotification(issueId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return { error: "You must be logged in" }
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

    // Send email to admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
    })

    for (const admin of admins) {
      if (admin.email) {
        const { subject, html } = emailTemplates.issueCreated(issue.title, issue.id)

        await sendEmail({
          to: admin.email,
          subject,
          html,
        })
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending issue created notification:", error)
    return { error: "Failed to send notification" }
  }
}

// Send issue assigned notification
export async function sendIssueAssignedNotification(issueId: string, facultyId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return { error: "You must be logged in" }
    }

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
    })

    if (!issue) {
      return { error: "Issue not found" }
    }

    const faculty = await prisma.user.findUnique({
      where: { id: facultyId },
    })

    if (!faculty || !faculty.email) {
      return { error: "Faculty not found or has no email" }
    }

    const { subject, html } = emailTemplates.issueAssigned(issue.title, issue.id)

    await sendEmail({
      to: faculty.email,
      subject,
      html,
    })

    return { success: true }
  } catch (error) {
    console.error("Error sending issue assigned notification:", error)
    return { error: "Failed to send notification" }
  }
}

// Send status updated notification
export async function sendStatusUpdatedNotification(issueId: string, status: StatusType) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return { error: "You must be logged in" }
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

    // Send to submitter
    if (issue.submittedBy.email && issue.submittedById !== session.user.id) {
      const { subject, html } = emailTemplates.statusUpdated(issue.title, issue.id, status)

      await sendEmail({
        to: issue.submittedBy.email,
        subject,
        html,
      })
    }

    // Send to assigned faculty if they didn't make the update
    if (issue.assignedTo?.email && issue.assignedToId !== session.user.id) {
      const { subject, html } = emailTemplates.statusUpdated(issue.title, issue.id, status)

      await sendEmail({
        to: issue.assignedTo.email,
        subject,
        html,
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending status updated notification:", error)
    return { error: "Failed to send notification" }
  }
}

// Send comment added notification
export async function sendCommentAddedNotification(issueId: string, commentId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return { error: "You must be logged in" }
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: true,
        issue: {
          include: {
            submittedBy: true,
            assignedTo: true,
          },
        },
      },
    })

    if (!comment) {
      return { error: "Comment not found" }
    }

    const issue = comment.issue
    const commenterName = comment.user.name || comment.user.email || "A user"

    // Send to submitter if they didn't make the comment
    if (issue.submittedBy.email && issue.submittedById !== comment.userId) {
      const { subject, html } = emailTemplates.commentAdded(issue.title, issue.id, commenterName)

      await sendEmail({
        to: issue.submittedBy.email,
        subject,
        html,
      })
    }

    // Send to assigned faculty if they didn't make the comment
    if (issue.assignedTo?.email && issue.assignedToId !== comment.userId) {
      const { subject, html } = emailTemplates.commentAdded(issue.title, issue.id, commenterName)

      await sendEmail({
        to: issue.assignedTo.email,
        subject,
        html,
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending comment added notification:", error)
    return { error: "Failed to send notification" }
  }
}

