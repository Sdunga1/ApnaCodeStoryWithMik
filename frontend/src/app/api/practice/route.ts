import { NextResponse } from 'next/server';
import { getPracticeTopicsWithProblems } from '@/lib/practice';

export async function GET() {
  try {
    const topics = await getPracticeTopicsWithProblems();
    return NextResponse.json({ success: true, topics });
  } catch (error) {
    console.error('Error fetching practice topics', error);
    return NextResponse.json(
      { success: false, message: 'Unable to load practice roadmap' },
      { status: 500 }
    );
  }
}


