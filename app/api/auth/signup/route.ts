import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { hashPassword, signToken } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'All fields (name, email, password, role) are required' },
        { status: 400 }
      );
    }

    if (role !== 'admin' && role !== 'employee') {
      return NextResponse.json(
        { error: 'Invalid role selection' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = hashPassword(password);
    
    // Set default balance: 15 for employees, 0 for admins
    const leaveBalance = role === 'employee' ? 15 : 0;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        leaveBalance,
      },
    });

    // Generate JWT token
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    // Return user info (excluding password)
    const { password: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
