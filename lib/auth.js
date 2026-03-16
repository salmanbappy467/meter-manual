import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const PBSNET_BASE_URL = process.env.PBSNET_BASE_URL;
const PBSNET_ADMIN_SECRET = process.env.PBSNET_ADMIN_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'salmanmeter';

// Verify user via PBSNet API
export async function verifyPBSNetUser(apiKey) {
  try {
    const response = await fetch(`${PBSNET_BASE_URL}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': PBSNET_ADMIN_SECRET
      },
      body: JSON.stringify({
        target_user_key: apiKey
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('PBSNet verification error:', error);
    return null;
  }
}

// Create JWT token
export function createToken(userData) {
  return jwt.sign(
    {
      username: userData.username,
      fullName: userData.full_name,
      apiKey: userData.apiKey,
      profilePic: userData.personal_json?.profile_pic || '',
      pbsName: userData.personal_json?.pbs_name || userData.app_json?.pbs_name || ''
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Get current user from cookie
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('meter-auth-token')?.value;
    
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

// Check if user is admin
export function isAdmin(username) {
  return username === ADMIN_USERNAME;
}

// Auth middleware helper
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Authentication required', status: 401 };
  }
  return { user };
}

// Admin middleware helper
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Authentication required', status: 401 };
  }
  if (!isAdmin(user.username)) {
    return { error: 'Admin access required', status: 403 };
  }
  return { user };
}
