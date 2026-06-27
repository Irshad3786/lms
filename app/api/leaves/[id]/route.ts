import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';
import { cookies } from 'next/headers';

// Helper to check authentication and admin authorization
async function getAuthenticatedAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  const user = verifyToken(token);
  if (!user || user.role !== 'admin') return null;
  return user;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin role required.' }, { status: 401 });
    }

    const { id } = await params;
    const { status, adminNotes } = await req.json();

    if (!status || (status !== 'APPROVED' && status !== 'REJECTED')) {
      return NextResponse.json(
        { error: 'Status must be APPROVED or REJECTED' },
        { status: 400 }
      );
    }

    // Retrieve the leave request
    const request = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!request) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json(
        { error: `This request has already been ${request.status}` },
        { status: 400 }
      );
    }

    if (status === 'APPROVED') {
      // For approved requests, decrement balance (unless it is Unpaid)
      if (request.type !== 'Unpaid') {
        if (request.user.leaveBalance < request.days) {
          return NextResponse.json(
            { error: `Employee has insufficient leave balance. Available: ${request.user.leaveBalance} days, Required: ${request.days} days.` },
            { status: 400 }
          );
        }

        // Deduct from balance and approve
        await prisma.$transaction([
          prisma.user.update({
            where: { id: request.userId },
            data: { leaveBalance: { decrement: request.days } },
          }),
          prisma.leaveRequest.update({
            where: { id },
            data: {
              status: 'APPROVED',
              adminNotes: adminNotes || '',
            },
          }),
        ]);
      } else {
        // Unpaid leave - just approve without deduction
        await prisma.leaveRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            adminNotes: adminNotes || '',
          },
        });
      }
    } else {
      // Status is REJECTED
      await prisma.leaveRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          adminNotes: adminNotes || '',
        },
      });
    }

    // Format display date range for notification
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const dateRangeStr = `${formatDate(request.startDate)} to ${formatDate(request.endDate)}`;

    // Create notification for employee
    await prisma.notification.create({
      data: {
        userId: request.userId,
        message: `Your leave request for ${dateRangeStr} (${request.days} days, ${request.type}) has been ${status}.${adminNotes ? ` Admin note: "${adminNotes}"` : ''}`,
        read: false,
      },
    });

    // Return the updated request
    const updatedRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            leaveBalance: true,
          },
        },
      },
    });

    return NextResponse.json({ request: updatedRequest });
  } catch (error) {
    console.error('Update leave request error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
