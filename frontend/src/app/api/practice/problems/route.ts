import { NextResponse } from 'next/server';
import { createPracticeProblem } from '@/lib/practice';
import type { PracticeProblemPayload } from '@/types/practice';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PracticeProblemPayload> & {
      topicId?: string;
    };
    if (!body.topicId) {
      return NextResponse.json(
        { success: false, message: 'topicId is required' },
        { status: 400 }
      );
    }
    const newProblem = await createPracticeProblem(body.topicId, {
      title: body.title ?? '',
      difficulty: (body.difficulty as PracticeProblemPayload['difficulty']) ?? 'Easy',
      leetcodeUrl: body.leetcodeUrl ?? '',
      solutionVideoUrl: body.solutionVideoUrl ?? undefined,
    });
    return NextResponse.json({ success: true, problem: newProblem });
  } catch (error: any) {
    console.error('Error creating practice problem', error);
    const message = error?.message ?? 'Unable to create practice problem';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}


