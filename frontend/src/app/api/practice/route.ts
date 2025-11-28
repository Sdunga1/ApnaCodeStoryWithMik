import { NextRequest, NextResponse } from 'next/server';
import { getPracticeTopicsWithProblems } from '@/lib/practice';
import { extractTokenFromHeader, verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Try to get userId from auth token if present
    let userId: string | undefined;
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        userId = payload.userId;
      }
    }

    const topics = await getPracticeTopicsWithProblems(userId);
    return NextResponse.json({ success: true, topics });
  } catch (error) {
    console.error('Error fetching practice topics', error);
    return NextResponse.json(
      { success: false, message: 'Unable to load practice roadmap' },
      { status: 500 }
    );
  }
}


