import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Check if user is authenticated
export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  return session.user
}

// Check if user has admin role
export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return session.user
}

// Check if user has faculty role
export async function requireFaculty() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "FACULTY" && session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return session.user
}

// Check if user can access an issue
export async function canAccessIssue(issueId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return false
  }

  // Admins can access all issues
  if (session.user.role === "ADMIN") {
    return true
  }

  // Check if user is the submitter or assigned faculty
  const count = await prisma.issue.count({
    where: {
      id: issueId,
      OR: [{ submittedById: session.user.id }, { assignedToId: session.user.id }],
    },
  })

  return count > 0
}

