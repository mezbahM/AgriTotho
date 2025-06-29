import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role, phoneNumber } = body;

    console.log("Registration attempt:", { name, email, role, phoneNumber });

    // Validate required fields
    if (!name || !email || !password || !role || !phoneNumber) {
      console.log("Missing fields:", { name, email, role, phoneNumber });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(UserRole).includes(role as UserRole)) {
      console.log("Invalid role:", role);
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phoneNumber }
        ],
      },
    });

    if (existingUser) {
      console.log("User exists:", { email, phoneNumber });
      return NextResponse.json(
        { error: "User with this email or phone number already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as UserRole,
        phoneNumber,
      },
    });

    console.log("User created successfully:", { id: user.id, email: user.email, role: user.role });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Error creating user", details: (error as Error).message },
      { status: 500 }
    );
  }
} 