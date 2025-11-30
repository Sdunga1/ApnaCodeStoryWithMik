import { NextRequest, NextResponse } from 'next/server';
import { getRoadmapData, saveRoadmapData } from '@/lib/roadmap';
import { extractTokenFromHeader, verifyToken } from '@/lib/jwt';
import { query } from '@/lib/db';
import type { DSATopic, DSAEdge } from '@/components/roadmap/data';

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

// GET: Fetch roadmap data (public - all users can view)
export async function GET() {
  try {
    const data = await getRoadmapData();
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error('Error fetching roadmap data', error);
    const message = error?.message ?? 'Unable to fetch roadmap data';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST: Save roadmap data (creator only)
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedCreator(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { topics, edges } = body as { topics: DSATopic[]; edges: DSAEdge[] };

    if (!Array.isArray(topics) || !Array.isArray(edges)) {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    await saveRoadmapData(topics, edges);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving roadmap data', error);
    const message = error?.message ?? 'Unable to save roadmap data';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

