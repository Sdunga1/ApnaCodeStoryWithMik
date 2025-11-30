import { query, getClient } from './db';
import type { DSATopic, DSAEdge } from '@/components/roadmap/data';

/**
 * Map database row to DSATopic
 */
const mapTopicRow = (row: any): DSATopic => ({
  id: row.id,
  name: row.name,
  position: [parseFloat(row.position_x), parseFloat(row.position_y), parseFloat(row.position_z)],
  description: row.description || '',
  category: row.category,
  shape: row.shape,
  scale: row.scale ? parseFloat(row.scale) : undefined,
  fontSize: row.font_size ? parseFloat(row.font_size) : undefined,
  textColor: row.text_color || undefined,
  youtubePlaylistLink: row.youtube_playlist_link || undefined,
  optionalLink: row.optional_link || undefined,
});

/**
 * Map database row to DSAEdge
 */
const mapEdgeRow = (row: any): DSAEdge => ({
  source: row.source_topic_id,
  target: row.target_topic_id,
});

/**
 * Get all roadmap topics and edges from database
 */
export async function getRoadmapData(): Promise<{ topics: DSATopic[]; edges: DSAEdge[] }> {
  const topicsRes = await query(
    `SELECT id, name, description, category, shape, 
            position_x, position_y, position_z, 
            scale, font_size, text_color,
            youtube_playlist_link, optional_link
     FROM roadmap_topics
     ORDER BY created_at ASC`
  );

  const edgesRes = await query(
    `SELECT source_topic_id, target_topic_id
     FROM roadmap_edges
     ORDER BY id ASC`
  );

  return {
    topics: topicsRes.rows.map(mapTopicRow),
    edges: edgesRes.rows.map(mapEdgeRow),
  };
}

/**
 * Save roadmap topics and edges to database
 */
export async function saveRoadmapData(topics: DSATopic[], edges: DSAEdge[]): Promise<void> {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Delete all existing topics (cascade will delete edges)
    await client.query('DELETE FROM roadmap_topics');

    // Insert all topics
    for (const topic of topics) {
      await client.query(
        `INSERT INTO roadmap_topics 
         (id, name, description, category, shape, 
          position_x, position_y, position_z, 
          scale, font_size, text_color,
          youtube_playlist_link, optional_link)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           category = EXCLUDED.category,
           shape = EXCLUDED.shape,
           position_x = EXCLUDED.position_x,
           position_y = EXCLUDED.position_y,
           position_z = EXCLUDED.position_z,
           scale = EXCLUDED.scale,
           font_size = EXCLUDED.font_size,
           text_color = EXCLUDED.text_color,
           youtube_playlist_link = EXCLUDED.youtube_playlist_link,
           optional_link = EXCLUDED.optional_link,
           updated_at = NOW()`,
        [
          topic.id,
          topic.name,
          topic.description,
          topic.category,
          topic.shape,
          topic.position[0],
          topic.position[1],
          topic.position[2],
          topic.scale ?? 1.0,
          topic.fontSize ?? 0.45,
          topic.textColor ?? '#ffffff',
          topic.youtubePlaylistLink || null,
          topic.optionalLink || null,
        ]
      );
    }

    // Insert all edges
    for (const edge of edges) {
      await client.query(
        `INSERT INTO roadmap_edges (source_topic_id, target_topic_id)
         VALUES ($1, $2)
         ON CONFLICT (source_topic_id, target_topic_id) DO NOTHING`,
        [edge.source, edge.target]
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

/**
 * Create a new roadmap topic
 */
export async function createRoadmapTopic(topic: DSATopic): Promise<DSATopic> {
  const { rows } = await query(
    `INSERT INTO roadmap_topics 
     (id, name, description, category, shape, 
      position_x, position_y, position_z, 
      scale, font_size, text_color,
      youtube_playlist_link, optional_link)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING id, name, description, category, shape, 
               position_x, position_y, position_z, 
               scale, font_size, text_color,
               youtube_playlist_link, optional_link`,
    [
      topic.id,
      topic.name,
      topic.description,
      topic.category,
      topic.shape,
      topic.position[0],
      topic.position[1],
      topic.position[2],
      topic.scale ?? 1.0,
      topic.fontSize ?? 0.45,
      topic.textColor ?? '#ffffff',
      topic.youtubePlaylistLink || null,
      topic.optionalLink || null,
    ]
  );

  if (!rows[0]) {
    throw new Error('Failed to create roadmap topic');
  }

  return mapTopicRow(rows[0]);
}

/**
 * Update a roadmap topic
 */
export async function updateRoadmapTopic(topicId: string, updates: Partial<DSATopic>): Promise<DSATopic> {
  const updatesList: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    updatesList.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    updatesList.push(`description = $${paramIndex++}`);
    values.push(updates.description);
  }
  if (updates.category !== undefined) {
    updatesList.push(`category = $${paramIndex++}`);
    values.push(updates.category);
  }
  if (updates.shape !== undefined) {
    updatesList.push(`shape = $${paramIndex++}`);
    values.push(updates.shape);
  }
  if (updates.position !== undefined) {
    updatesList.push(`position_x = $${paramIndex++}, position_y = $${paramIndex++}, position_z = $${paramIndex++}`);
    values.push(updates.position[0], updates.position[1], updates.position[2]);
  }
  if (updates.scale !== undefined) {
    updatesList.push(`scale = $${paramIndex++}`);
    values.push(updates.scale);
  }
  if (updates.fontSize !== undefined) {
    updatesList.push(`font_size = $${paramIndex++}`);
    values.push(updates.fontSize);
  }
  if (updates.textColor !== undefined) {
    updatesList.push(`text_color = $${paramIndex++}`);
    values.push(updates.textColor);
  }
  if (updates.youtubePlaylistLink !== undefined) {
    updatesList.push(`youtube_playlist_link = $${paramIndex++}`);
    values.push(updates.youtubePlaylistLink || null);
  }
  if (updates.optionalLink !== undefined) {
    updatesList.push(`optional_link = $${paramIndex++}`);
    values.push(updates.optionalLink || null);
  }

  if (updatesList.length === 0) {
    throw new Error('No updates provided');
  }

  values.push(topicId);

  const { rows } = await query(
    `UPDATE roadmap_topics
     SET ${updatesList.join(', ')}, updated_at = NOW()
     WHERE id = $${paramIndex}
     RETURNING id, name, description, category, shape, 
               position_x, position_y, position_z, 
               scale, font_size, text_color,
               youtube_playlist_link, optional_link`,
    values
  );

  if (!rows[0]) {
    throw new Error('Roadmap topic not found');
  }

  return mapTopicRow(rows[0]);
}

/**
 * Delete a roadmap topic
 */
export async function deleteRoadmapTopic(topicId: string): Promise<void> {
  const { rowCount } = await query(
    `DELETE FROM roadmap_topics WHERE id = $1`,
    [topicId]
  );

  if (rowCount === 0) {
    throw new Error('Roadmap topic not found');
  }
}

