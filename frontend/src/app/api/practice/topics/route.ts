import { NextResponse } from 'next/server';
import { createPracticeTopic, updatePracticeTopic } from '@/lib/practice';
import type { PracticeTopicPayload } from '@/types/practice';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PracticeTopicPayload>;
    const newTopic = await createPracticeTopic({
      title: body.title ?? '',
    });
    return NextResponse.json({ success: true, topic: newTopic });
  } catch (error: any) {
    console.error('Error creating practice topic', error);
    const message = error?.message ?? 'Unable to create practice topic';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
