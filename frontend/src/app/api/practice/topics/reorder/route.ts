import { NextResponse } from 'next/server';
import { reorderPracticeTopics } from '@/lib/practice';

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { orderedIds?: string[] };
    if (!body.orderedIds || !Array.isArray(body.orderedIds) || body.orderedIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'orderedIds array is required' },
        { status: 400 }
      );
    }
    await reorderPracticeTopics(body.orderedIds);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error reordering practice topics', error);
    const message = error?.message ?? 'Unable to reorder topics';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}


