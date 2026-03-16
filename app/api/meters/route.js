import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MeterManual from '@/models/MeterManual';
import { getCurrentUser, requireAuth } from '@/lib/auth';

// GET - Search/filter meters (public)
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const manufacturer = searchParams.get('manufacturer');
    const item = searchParams.get('item');
    const types = searchParams.get('types');
    const status = searchParams.get('status') || 'approved';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = {};

    // Only show approved meters for public, unless user is admin
    const user = await getCurrentUser();
    if (status === 'all' && user) {
      // admin or user viewing their own
    } else if (status === 'my' && user) {
      query['createdBy.username'] = user.username;
    } else {
      query.status = 'approved';
    }

    // Search by serial number (check if falls within ranges)
    if (q) {
      const serialNum = parseInt(q);
      if (!isNaN(serialNum)) {
        query['serialRanges'] = {
          $elemMatch: {
            start: { $lte: serialNum },
            end: { $gte: serialNum }
          }
        };
      } else {
        // Text search
        query.$or = [
          { manufacturer: { $regex: q, $options: 'i' } },
          { types: { $regex: q, $options: 'i' } },
          { item: { $regex: q, $options: 'i' } },
          { idNote: { $regex: q, $options: 'i' } }
        ];
      }
    }

    if (manufacturer) {
      query.manufacturer = { $regex: manufacturer, $options: 'i' };
    }
    if (item) {
      query.item = { $regex: item, $options: 'i' };
    }
    if (types) {
      query.types = { $regex: types, $options: 'i' };
    }

    const total = await MeterManual.countDocuments(query);
    const meters = await MeterManual.find(query)
      .select('manufacturer types item idNote serialRanges status createdBy createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get unique manufacturers and items for filters
    const manufacturers = await MeterManual.distinct('manufacturer', { status: 'approved' });
    const items = await MeterManual.distinct('item', { status: 'approved' });

    return NextResponse.json({
      meters,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      filters: { manufacturers, items }
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Create new meter manual (auth required)
export async function POST(request) {
  try {
    const authResult = await requireAuth();
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const body = await request.json();
    const user = authResult.user;

    const meter = new MeterManual({
      ...body,
      status: 'pending',
      createdBy: {
        username: user.username,
        fullName: user.fullName,
        pbsName: user.pbsName,
        profilePic: user.profilePic,
        apiKey: user.apiKey
      },
      contributors: [{
        username: user.username,
        fullName: user.fullName,
        pbsName: user.pbsName,
        profilePic: user.profilePic,
        contribution: 'Created meter manual',
        date: new Date()
      }]
    });

    await meter.save();

    return NextResponse.json({ success: true, meter }, { status: 201 });
  } catch (error) {
    console.error('Create meter error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
