import { NextResponse } from 'next/server';
import { reorderPracticeProblems } from '@/lib/practice';

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { topicId?: string; orderedIds?: string[] };
    if (!body.topicId) {
      return NextResponse.json(
        { success: false, message: 'topicId is required' },
        { status: 400 }
      );
    }
    if (!body.orderedIds || !Array.isArray(body.orderedIds) || body.orderedIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'orderedIds array is required' },
        { status: 400 }
      );
    }
    await reorderPracticeProblems(body.topicId, body.orderedIds);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error reordering practice problems', error);
    const message = error?.message ?? 'Unable to reorder problems';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}


