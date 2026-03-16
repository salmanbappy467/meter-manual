import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DisplayManual from '@/models/DisplayManual';
import { requireAuth } from '@/lib/auth';

// POST - Toggle like
export async function POST(request, { params }) {
  try {
    const authResult = await requireAuth();
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const { id } = await params;
    const dm = await DisplayManual.findById(id);

    if (!dm) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const username = authResult.user.username;
    const likeIndex = dm.likes.indexOf(username);

    if (likeIndex === -1) {
      dm.likes.push(username);
      dm.likeCount = dm.likes.length;
    } else {
      dm.likes.splice(likeIndex, 1);
      dm.likeCount = dm.likes.length;
    }

    await dm.save();

    return NextResponse.json({
      success: true,
      liked: likeIndex === -1,
      likeCount: dm.likeCount
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
