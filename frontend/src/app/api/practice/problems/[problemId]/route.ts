import { NextResponse } from 'next/server';
import { updatePracticeProblem, deletePracticeProblem } from '@/lib/practice';
import type { PracticeProblemPayload } from '@/types/practice';

export async function PATCH(
  request: Request,
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

export async function DELETE(
  request: Request,
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
    await deletePracticeProblem(problemId);
    return NextResponse.json({ success: true, message: 'Problem deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting practice problem', error);
    const message = error?.message ?? 'Unable to delete problem';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}


