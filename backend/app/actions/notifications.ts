"use server"

import { getServerSession } from "next-auth/next"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import type { NotificationType } from "@prisma/client"

// Create a notification
export async function createNotification({
  userId,
  type,
  message,
}: {
  userId: string
  type: NotificationType
  message: string
}) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        message,
      },
    })

    revalidatePath("/notifications")
    return { success: true }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { error: "Failed to create notification" }
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return { error: "You must be logged in" }
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return { error: "Notification not found" }
    }

    if (notification.userId !== session.user.id) {
      return { error: "You don't have permission to update this notification" }
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    })

    revalidatePath("/notifications")
    return { success: true }
  } catch (error) {
    return { error: "Something went wrong" }
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return { error: "You must be logged in" }
    }

    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: { read: true },
    })

    revalidatePath("/notifications")
    return { success: true }
  } catch (error) {
    return { error: "Something went wrong" }
  }
}

// Get user notifications
export async function getUserNotifications(limit = 10) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      throw new Error("You must be logged in")
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    })

    return { notifications, unreadCount }
  } catch (error) {
    console.error("Error fetching notifications:", error)
    throw new Error("Failed to fetch notifications")
  }
}

