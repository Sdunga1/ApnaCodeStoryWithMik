import { NextResponse } from 'next/server';
import { updatePracticeTopic } from '@/lib/practice';
import type { PracticeTopicPayload } from '@/types/practice';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params;
    const body = (await request.json()) as Partial<PracticeTopicPayload>;
    const updatedTopic = await updatePracticeTopic(topicId, {
      title: body.title ?? '',
    });
    return NextResponse.json({ success: true, topic: updatedTopic });
  } catch (error: any) {
    console.error('Error updating practice topic', error);
    const message = error?.message ?? 'Unable to update practice topic';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
