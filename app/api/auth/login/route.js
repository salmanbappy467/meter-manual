import { NextResponse } from 'next/server';
import { verifyPBSNetUser, createToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    const userData = await verifyPBSNetUser(apiKey);

    if (!userData) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Create JWT token
    const token = createToken({ ...userData, apiKey });

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        username: userData.username,
        fullName: userData.full_name,
        profilePic: userData.personal_json?.profile_pic || '',
        pbsName: userData.personal_json?.pbs_name || userData.app_json?.pbs_name || ''
      }
    });

    response.cookies.set('meter-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
