import { NextResponse } from 'next/server';
import { updatePracticeProblem } from '@/lib/practice';
import type { PracticeProblemPayload } from '@/types/practice';

interface Params {
  problemId: string;
}

export async function PATCH(request: Request, context: { params: Params }) {
  const { problemId } = context.params;
  if (!problemId) {
    return NextResponse.json(
      { success: false, message: 'Problem id is required' },
      { status: 400 }
    );
  }
  try {
    const body = (await request.json()) as Partial<PracticeProblemPayload>;
    const updated = await updatePracticeProblem(problemId, {
      title: body.title ?? '',
      difficulty: (body.difficulty as PracticeProblemPayload['difficulty']) ?? 'Easy',
      leetcodeUrl: body.leetcodeUrl ?? '',
      solutionVideoUrl: body.solutionVideoUrl ?? undefined,
    });
    return NextResponse.json({ success: true, problem: updated });
  } catch (error: any) {
    console.error('Error updating practice problem', error);
    const message = error?.message ?? 'Unable to update problem';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}


