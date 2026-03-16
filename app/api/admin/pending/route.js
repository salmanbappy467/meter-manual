import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MeterManual from '@/models/MeterManual';
import DisplayManual from '@/models/DisplayManual';
import { requireAdmin } from '@/lib/auth';

// GET - All pending items
export async function GET() {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const pendingMeters = await MeterManual.find({ status: 'pending' })
      .sort({ createdAt: -1 }).lean();
    const pendingDisplayManuals = await DisplayManual.find({ status: 'pending' })
      .sort({ createdAt: -1 }).lean();
    const allMeters = await MeterManual.find()
      .sort({ createdAt: -1 }).lean();
    const allDisplayManuals = await DisplayManual.find()
      .sort({ createdAt: -1 }).lean();

    // Get meters with pending images
    const metersWithPendingImages = await MeterManual.find({
      'images.approved': false
    }).select('manufacturer types item images').lean();

    return NextResponse.json({
      pendingMeters,
      pendingDisplayManuals,
      allMeters,
      allDisplayManuals,
      metersWithPendingImages
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
