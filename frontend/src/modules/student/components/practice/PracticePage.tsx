'use client';

import { PracticePageBase } from '@/modules/practice/components/PracticePageBase';
import { problemSections } from '@/modules/practice/data/problemSections';

export function StudentPracticePage() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <PracticePageBase
        title="DSA Problem Roadmap"
        subtitle="Master Data Structures & Algorithms with codestorywithMIK"
        problemSections={problemSections}
      />
    </div>
  );
}

