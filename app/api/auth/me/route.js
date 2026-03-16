import { NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        username: user.username,
        fullName: user.fullName,
        profilePic: user.profilePic,
        pbsName: user.pbsName,
        isAdmin: isAdmin(user.username)
      }
    });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
