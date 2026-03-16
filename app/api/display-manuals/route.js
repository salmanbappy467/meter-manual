import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DisplayManual from '@/models/DisplayManual';
import { requireAuth, getCurrentUser, isAdmin } from '@/lib/auth';

// GET - List display manuals for a meter
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const meterId = searchParams.get('meterId');
    const all = searchParams.get('all');

    if (!meterId) {
      return NextResponse.json({ error: 'meterId required' }, { status: 400 });
    }

    let query = { meterId };
    const user = await getCurrentUser();
    
    if (all !== 'true') {
      // Public: show only approved, or user's own
      if (user) {
        query.$or = [
          { status: 'approved' },
          { 'createdBy.username': user.username }
        ];
      } else {
        query.status = 'approved';
      }
    }

    const displayManuals = await DisplayManual.find(query)
      .sort({ likeCount: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ displayManuals });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Create new display manual
export async function POST(request) {
  try {
    const authResult = await requireAuth();
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const body = await request.json();
    const user = authResult.user;

    const displayManual = new DisplayManual({
      ...body,
      status: 'pending',
      likes: [],
      likeCount: 0,
      createdBy: {
        username: user.username,
        fullName: user.fullName,
        pbsName: user.pbsName,
        profilePic: user.profilePic,
        apiKey: user.apiKey
      }
    });

    await displayManual.save();

    return NextResponse.json({ success: true, displayManual }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
