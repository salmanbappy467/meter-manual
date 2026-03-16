import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DisplayManual from '@/models/DisplayManual';
import { getCurrentUser, isAdmin } from '@/lib/auth';

// GET single
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const dm = await DisplayManual.findById(id).lean();
    if (!dm) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ displayManual: dm });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT - Update
export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const dm = await DisplayManual.findById(id);
    if (!dm) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (user.username !== dm.createdBy?.username && !isAdmin(user.username)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    if (!isAdmin(user.username)) {
      body.status = 'pending';
    }

    Object.assign(dm, body);
    await dm.save();

    return NextResponse.json({ success: true, displayManual: dm });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user.username)) {
      return NextResponse.json({ error: 'Admin required' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    await DisplayManual.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
