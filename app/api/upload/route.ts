import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "You must be logged in to upload files" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const issueId = formData.get("issueId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!issueId) {
      return NextResponse.json({ error: "Issue ID is required" }, { status: 400 })
    }

    // Check if issue exists
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
    })

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads")

    // Generate a unique filename
    const uniqueFilename = `${uuidv4()}-${file.name}`
    const filePath = join("uploads", uniqueFilename)
    const fullPath = join(process.cwd(), "public", filePath)

    // Convert file to buffer and save it
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(fullPath, buffer)

    // Save file info to database
    const attachment = await prisma.attachment.create({
      data: {
        issueId,
        filename: file.name,
        path: `/uploads/${uniqueFilename}`,
        mimetype: file.type,
        size: file.size,
      },
    })

    return NextResponse.json({
      success: true,
      attachment,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

