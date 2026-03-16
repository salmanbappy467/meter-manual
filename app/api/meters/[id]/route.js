import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MeterManual from '@/models/MeterManual';
import { getCurrentUser, isAdmin } from '@/lib/auth';

// GET - Get single meter
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const meter = await MeterManual.findById(id).lean();

    if (!meter) {
      return NextResponse.json({ error: 'Meter not found' }, { status: 404 });
    }

    // If not approved, only creator or admin can view
    if (meter.status !== 'approved') {
      const user = await getCurrentUser();
      if (!user || (user.username !== meter.createdBy?.username && !isAdmin(user.username))) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ meter });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT - Update meter
export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const meter = await MeterManual.findById(id);

    if (!meter) {
      return NextResponse.json({ error: 'Meter not found' }, { status: 404 });
    }

    // Only creator or admin can edit
    if (user.username !== meter.createdBy?.username && !isAdmin(user.username)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();

    // If not admin, set back to pending after edit
    if (!isAdmin(user.username)) {
      body.status = 'pending';
    }

    // Add to contributors
    const existingContributor = meter.contributors.find(c => c.username === user.username);
    if (!existingContributor) {
      meter.contributors.push({
        username: user.username,
        fullName: user.fullName,
        pbsName: user.pbsName,
        profilePic: user.profilePic,
        contribution: 'Updated meter manual',
        date: new Date()
      });
    }

    Object.assign(meter, body);
    meter.contributors = meter.contributors; // ensure updated
    await meter.save();

    return NextResponse.json({ success: true, meter });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Delete meter (admin only)
export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user.username)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    await MeterManual.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
