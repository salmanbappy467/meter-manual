import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MeterManual from '@/models/MeterManual';
import DisplayManual from '@/models/DisplayManual';
import { requireAdmin } from '@/lib/auth';

// POST - Approve/Reject/Delete
export async function POST(request) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const { type, id, action, imageIndex } = await request.json();

    if (type === 'meter') {
      if (action === 'approve') {
        await MeterManual.findByIdAndUpdate(id, { status: 'approved' });
      } else if (action === 'reject') {
        await MeterManual.findByIdAndUpdate(id, { status: 'rejected' });
      } else if (action === 'delete') {
        await MeterManual.findByIdAndDelete(id);
        // Also delete related display manuals
        await DisplayManual.deleteMany({ meterId: id });
      }
    } else if (type === 'display-manual') {
      if (action === 'approve') {
        await DisplayManual.findByIdAndUpdate(id, { status: 'approved' });
      } else if (action === 'reject') {
        await DisplayManual.findByIdAndUpdate(id, { status: 'rejected' });
      } else if (action === 'delete') {
        await DisplayManual.findByIdAndDelete(id);
      }
    } else if (type === 'image') {
      const meter = await MeterManual.findById(id);
      if (meter && meter.images[imageIndex]) {
        if (action === 'approve') {
          meter.images[imageIndex].approved = true;
        } else if (action === 'delete') {
          meter.images.splice(imageIndex, 1);
        }
        await meter.save();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
