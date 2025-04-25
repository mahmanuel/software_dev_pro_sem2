"use server"

import { hash } from "bcrypt"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { Role } from "@prisma/client"

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum([Role.STUDENT, Role.FACULTY, Role.ADMIN]).default(Role.STUDENT),
  department: z.string().optional(),
})

export async function registerUser(formData: FormData) {
  try {
    const validatedFields = userSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role") || Role.STUDENT,
      department: formData.get("department"),
    })

    const { name, email, password, role, department } = validatedFields

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        department,
      },
    })

    return { success: "User registered successfully", userId: user.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }

    return { error: "Something went wrong. Please try again." }
  }
}

