import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/auth';
import { cookies } from 'next/headers';

// Helper to check authentication
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role === 'admin') {
      // Admins view all requests with employee names
      const requests = await prisma.leaveRequest.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
              leaveBalance: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return NextResponse.json({ requests });
    } else {
      // Employees view only their own requests
      const requests = await prisma.leaveRequest.findMany({
        where: { userId: user.id },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return NextResponse.json({ requests });
    }
  } catch (error) {
    console.error('Fetch leaves error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'employee') {
      return NextResponse.json(
        { error: 'Only employees can apply for leaves' },
        { status: 403 }
      );
    }

    const { startDate, endDate, type, reason } = await req.json();

    if (!startDate || !endDate || !type || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    if (start > end) {
      return NextResponse.json(
        { error: 'Start date cannot be after end date' },
        { status: 400 }
      );
    }

    // Calculate days requested (inclusive)
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Fetch user's current leave balance
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { leaveBalance: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check balance for Annual or Sick leaves (optional check, unpaid doesn't deduct)
    if (type !== 'Unpaid' && dbUser.leaveBalance < days) {
      return NextResponse.json(
        { error: `Insufficient leave balance. Requested: ${days} days, Available: ${dbUser.leaveBalance} days.` },
        { status: 400 }
      );
    }

    // Create the leave request
    const request = await prisma.leaveRequest.create({
      data: {
        userId: user.id,
        startDate: start,
        endDate: end,
        days,
        type,
        reason,
        status: 'PENDING',
      },
    });

    // Create a notification for Admins
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true },
    });

    const notificationPromises = admins.map((admin) =>
      prisma.notification.create({
        data: {
          userId: admin.id,
          message: `New leave request submitted by ${user.name} for ${days} days (${type}).`,
          read: false,
        },
      })
    );
    await Promise.all(notificationPromises);

    return NextResponse.json({ request }, { status: 201 });
  } catch (error) {
    console.error('Create leave error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
