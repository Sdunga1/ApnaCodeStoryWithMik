import { NextRequest, NextResponse } from 'next/server';
import { toggleProblemStar } from '@/lib/practice';
import { extractTokenFromHeader, verifyToken } from '@/lib/jwt';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ problemId: string }> }
) {
  try {
    const { problemId } = await params;
    if (!problemId) {
      return NextResponse.json(
        { success: false, message: 'Problem id is required' },
        { status: 400 }
      );
    }

    // Extract and verify token
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { userId } = payload;

    // Toggle star status
    const isStarred = await toggleProblemStar(userId, problemId);

    return NextResponse.json({
      success: true,
      isStarred,
    });
  } catch (error: any) {
    console.error('Error toggling problem star', error);
    const message = error?.message ?? 'Unable to toggle star';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

