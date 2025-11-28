import { getClient, query } from './db';
import type { PracticeProblem, PracticeTopic, PracticeProblemPayload, PracticeTopicPayload } from '@/types/practice';

const difficultySet = new Set(['Easy', 'Medium', 'Hard']);

const mapProblemRow = (row: any): PracticeProblem => ({
  id: row.id,
  title: row.title,
  difficulty: row.difficulty,
  leetcodeUrl: row.leetcode_url,
  solutionVideoUrl: row.solution_video_url,
  position: row.position,
});

export async function getPracticeTopicsWithProblems(): Promise<PracticeTopic[]> {
  const topicsRes = await query(
    `SELECT id, title, position
     FROM practice_topics
     ORDER BY position ASC, created_at ASC`
  );

  const problemsRes = await query(
    `SELECT id, topic_id, title, difficulty, leetcode_url, solution_video_url, position
     FROM practice_problems
     ORDER BY topic_id ASC, position ASC, created_at ASC`
  );

  const problemsByTopic = new Map<string, PracticeProblem[]>();
  for (const row of problemsRes.rows) {
    const list = problemsByTopic.get(row.topic_id) ?? [];
    list.push(mapProblemRow(row));
    problemsByTopic.set(row.topic_id, list);
  }

  return topicsRes.rows.map((topic: any) => ({
    id: topic.id,
    title: topic.title,
    position: topic.position,
    problems: problemsByTopic.get(topic.id) ?? [],
  }));
}

function validatePayload(payload: PracticeProblemPayload) {
  if (!payload.title?.trim()) throw new Error('Problem title is required');
  if (!payload.leetcodeUrl?.trim()) throw new Error('LeetCode link is required');
  if (!difficultySet.has(payload.difficulty)) throw new Error('Invalid difficulty');
}

export async function createPracticeProblem(
  topicId: string,
  payload: PracticeProblemPayload
): Promise<PracticeProblem> {
  validatePayload(payload);
  const { rows } = await query(
    `INSERT INTO practice_problems (topic_id, title, difficulty, leetcode_url, solution_video_url, position)
     VALUES (
       $1, $2, $3, $4, $5,
       COALESCE((SELECT MAX(position) FROM practice_problems WHERE topic_id = $1), 0) + 1
     )
     RETURNING id, title, difficulty, leetcode_url, solution_video_url, position`,
    [topicId, payload.title.trim(), payload.difficulty, payload.leetcodeUrl.trim(), payload.solutionVideoUrl?.trim() ?? null]
  );
  if (!rows[0]) {
    throw new Error('Failed to insert practice problem');
  }
  return mapProblemRow(rows[0]);
}

export async function updatePracticeProblem(
  problemId: string,
  payload: PracticeProblemPayload
): Promise<PracticeProblem> {
  validatePayload(payload);
  const { rows } = await query(
    `UPDATE practice_problems
     SET title = $2,
         difficulty = $3,
         leetcode_url = $4,
         solution_video_url = $5,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, title, difficulty, leetcode_url, solution_video_url, position`,
    [problemId, payload.title.trim(), payload.difficulty, payload.leetcodeUrl.trim(), payload.solutionVideoUrl?.trim() ?? null]
  );
  if (!rows[0]) {
    throw new Error('Practice problem not found');
  }
  return mapProblemRow(rows[0]);
}

export async function reorderPracticeProblems(topicId: string, orderedIds: string[]) {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw new Error('orderedIds array is required');
  }
  const client = await getClient();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < orderedIds.length; i += 1) {
      await client.query(
        `UPDATE practice_problems
         SET position = $1
         WHERE id = $2 AND topic_id = $3`,
        [i + 1, orderedIds[i], topicId]
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function reorderPracticeTopics(orderedIds: string[]) {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw new Error('orderedIds array is required');
  }
  const client = await getClient();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < orderedIds.length; i += 1) {
      await client.query(
        `UPDATE practice_topics
         SET position = $1
         WHERE id = $2`,
        [i + 1, orderedIds[i]]
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function createPracticeTopic(
  payload: PracticeTopicPayload
): Promise<PracticeTopic> {
  if (!payload.title?.trim()) {
    throw new Error('Topic title is required');
  }
  const { rows } = await query(
    `INSERT INTO practice_topics (title, position)
     VALUES (
       $1,
       COALESCE((SELECT MAX(position) FROM practice_topics), 0) + 1
     )
     RETURNING id, title, position`,
    [payload.title.trim()]
  );
  if (!rows[0]) {
    throw new Error('Failed to insert practice topic');
  }
  return {
    id: rows[0].id,
    title: rows[0].title,
    position: rows[0].position,
    problems: [],
  };
}

export async function updatePracticeTopic(
  topicId: string,
  payload: PracticeTopicPayload
): Promise<PracticeTopic> {
  if (!payload.title?.trim()) {
    throw new Error('Topic title is required');
  }
  const { rows } = await query(
    `UPDATE practice_topics
     SET title = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, title, position`,
    [topicId, payload.title.trim()]
  );
  if (!rows[0]) {
    throw new Error('Practice topic not found');
  }
  return {
    id: rows[0].id,
    title: rows[0].title,
    position: rows[0].position,
    problems: [],
  };
}

export async function deletePracticeTopic(topicId: string): Promise<void> {
  const { rowCount } = await query(
    `DELETE FROM practice_topics WHERE id = $1`,
    [topicId]
  );
  if (rowCount === 0) {
    throw new Error('Practice topic not found');
  }
}

export async function deletePracticeProblem(problemId: string): Promise<void> {
  const { rowCount } = await query(
    `DELETE FROM practice_problems WHERE id = $1`,
    [problemId]
  );
  if (rowCount === 0) {
    throw new Error('Practice problem not found');
  }
}


