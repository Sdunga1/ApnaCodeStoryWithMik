import { NextRequest, NextResponse } from 'next/server';
import { updateRoadmapTopic, deleteRoadmapTopic } from '@/lib/roadmap';
import { extractTokenFromHeader, verifyToken } from '@/lib/jwt';
import { query } from '@/lib/db';
import type { DSATopic } from '@/components/roadmap/data';

async function getAuthenticatedCreator(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return {
      error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return {
      error: NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 }),
    };
  }

  // Check if user is creator
  const userResult = await query(
    `SELECT role FROM users WHERE id = $1 AND is_deleted = FALSE`,
    [payload.userId]
  );

  if (userResult.rows.length === 0) {
    return {
      error: NextResponse.json({ success: false, error: 'User not found' }, { status: 404 }),
    };
  }

  if (userResult.rows[0].role !== 'creator') {
    return {
      error: NextResponse.json(
        { success: false, error: 'Only creators can modify roadmap' },
        { status: 403 }
      ),
    };
  }

  return { userId: payload.userId };
}

// PUT: Update a roadmap topic (creator only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const auth = await getAuthenticatedCreator(request);
    if ('error' in auth) return auth.error;

    const { topicId } = await params;
    const body = await request.json();
    const updates = body as Partial<DSATopic>;

    const updatedTopic = await updateRoadmapTopic(topicId, updates);
    return NextResponse.json({ success: true, topic: updatedTopic });
  } catch (error: any) {
    console.error('Error updating roadmap topic', error);
    const message = error?.message ?? 'Unable to update roadmap topic';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE: Delete a roadmap topic (creator only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const auth = await getAuthenticatedCreator(request);
    if ('error' in auth) return auth.error;

    const { topicId } = await params;
    await deleteRoadmapTopic(topicId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting roadmap topic', error);
    const message = error?.message ?? 'Unable to delete roadmap topic';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

