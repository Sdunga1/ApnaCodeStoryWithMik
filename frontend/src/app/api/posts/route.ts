import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { extractTokenFromHeader, verifyToken } from '@/lib/jwt';

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  const payload = verifyToken(token);

  if (!payload) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      ),
    };
  }

  // Check if user is creator
  const userResult = await query(
    `SELECT role FROM users WHERE id = $1 AND is_deleted = FALSE`,
    [payload.userId]
  );

  if (userResult.rows.length === 0) {
    return {
      error: NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      ),
    };
  }

  if (userResult.rows[0].role !== 'creator') {
    return {
      error: NextResponse.json(
        { success: false, error: 'Only creators can create posts' },
        { status: 403 }
      ),
    };
  }

  return { userId: payload.userId };
}

function mapRowToPost(row: any) {
  return {
    id: row.id,
    problemName: row.problem_name,
    difficulty: row.difficulty,
    postDate: row.post_date,
    thumbnailUrl: row.thumbnail_url,
    youtubeLink: row.youtube_link,
    leetcodeLink: row.lc_daily_link,
    githubLink: row.github_link,
    motivationalQuote: row.motivational_quote,
    tags: Array.isArray(row.tags) ? row.tags : [],
    extraLinks: Array.isArray(row.extra_links) ? row.extra_links : [],
    createdAt: row.created_at,
  };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const {
      motivationalQuote,
      problemName,
      difficulty,
      postDate,
      thumbnailUrl,
      youtubeLink,
      leetcodeLink,
      githubLink,
      tags,
      optionalLinks,
    } = body;

    // Validation
    if (!problemName || !problemName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Problem name is required' },
        { status: 400 }
      );
    }

    if (!difficulty || !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid difficulty (Easy, Medium, Hard) is required',
        },
        { status: 400 }
      );
    }

    if (!postDate) {
      return NextResponse.json(
        { success: false, error: 'Post date is required' },
        { status: 400 }
      );
    }

    if (!thumbnailUrl || !thumbnailUrl.trim()) {
      return NextResponse.json(
        { success: false, error: 'Thumbnail URL is required' },
        { status: 400 }
      );
    }

    if (!youtubeLink || !youtubeLink.trim()) {
      return NextResponse.json(
        { success: false, error: 'YouTube link is required' },
        { status: 400 }
      );
    }

    if (!leetcodeLink || !leetcodeLink.trim()) {
      return NextResponse.json(
        { success: false, error: 'LeetCode link is required' },
        { status: 400 }
      );
    }

    if (!githubLink || !githubLink.trim()) {
      return NextResponse.json(
        { success: false, error: 'GitHub link is required' },
        { status: 400 }
      );
    }

    let sanitizedYoutube = '';
    let sanitizedLeetcode = '';
    let sanitizedGithub = '';
    let sanitizedThumbnail = '';

    try {
      const validateHttpUrl = (value: string) => {
        const trimmed = value.trim();
        new URL(trimmed);
        return trimmed;
      };

      const sanitizeThumbnail = (value: string) => {
        const trimmed = value.trim();
        if (trimmed.startsWith('data:image')) {
          return trimmed;
        }
        new URL(trimmed);
        return trimmed;
      };

      sanitizedYoutube = validateHttpUrl(youtubeLink);
      sanitizedLeetcode = validateHttpUrl(leetcodeLink);
      sanitizedGithub = validateHttpUrl(githubLink);
      sanitizedThumbnail = sanitizeThumbnail(thumbnailUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate date is not in the future (for now, can be relaxed later for scheduling)
    const selectedDate = new Date(postDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      return NextResponse.json(
        { success: false, error: 'Cannot create posts for future dates' },
        { status: 400 }
      );
    }

    // Insert post
    const result = await query(
      `INSERT INTO posts (
        problem_name, difficulty, post_date, thumbnail_url,
        youtube_link, lc_daily_link, github_link,
        motivational_quote, tags, extra_links
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, problem_name, difficulty, post_date, thumbnail_url,
                youtube_link, lc_daily_link, github_link,
                motivational_quote, tags, extra_links, created_at`,
      [
        problemName.trim(),
        difficulty,
        postDate,
        sanitizedThumbnail,
        sanitizedYoutube,
        sanitizedLeetcode,
        sanitizedGithub,
        motivationalQuote?.trim() || null,
        JSON.stringify(Array.isArray(tags) ? tags : []),
        JSON.stringify(optionalLinks || []),
      ]
    );

    const post = result.rows[0];

    // Create daily_problem entry
    await query(
      `INSERT INTO daily_problems (problem_date, post_id)
       VALUES ($1, $2)
       ON CONFLICT (problem_date) DO UPDATE SET post_id = $2`,
      [postDate, post.id]
    );

    return NextResponse.json(
      {
        success: true,
        post: mapRowToPost(post),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create post error:', error);

    if (error?.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'A post already exists for this date' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const id = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (id) {
      const result = await query(
        `SELECT 
          id, problem_name, difficulty, post_date, thumbnail_url,
          youtube_link, lc_daily_link, github_link,
          motivational_quote, tags, extra_links, created_at
        FROM posts
        WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Post not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, post: mapRowToPost(result.rows[0]) },
        { status: 200 }
      );
    }

    let queryText = `
      SELECT 
        id, problem_name, difficulty, post_date, thumbnail_url,
        youtube_link, lc_daily_link, github_link,
        motivational_quote, tags, extra_links, created_at
      FROM posts
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (date) {
      paramCount++;
      queryText += ` WHERE post_date = $${paramCount}`;
      params.push(date);
    }

    queryText += ` ORDER BY post_date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    const posts = result.rows.map(mapRowToPost);

    return NextResponse.json({ success: true, posts }, { status: 200 });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const {
      id,
      motivationalQuote,
      problemName,
      difficulty,
      postDate,
      thumbnailUrl,
      youtubeLink,
      leetcodeLink,
      githubLink,
      tags,
      optionalLinks,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    if (!problemName || !problemName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Problem name is required' },
        { status: 400 }
      );
    }

    if (!difficulty || !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid difficulty (Easy, Medium, Hard) is required',
        },
        { status: 400 }
      );
    }

    if (!postDate) {
      return NextResponse.json(
        { success: false, error: 'Post date is required' },
        { status: 400 }
      );
    }

    if (!thumbnailUrl || !thumbnailUrl.trim()) {
      return NextResponse.json(
        { success: false, error: 'Thumbnail URL is required' },
        { status: 400 }
      );
    }

    if (!youtubeLink || !youtubeLink.trim()) {
      return NextResponse.json(
        { success: false, error: 'YouTube link is required' },
        { status: 400 }
      );
    }

    if (!leetcodeLink || !leetcodeLink.trim()) {
      return NextResponse.json(
        { success: false, error: 'LeetCode link is required' },
        { status: 400 }
      );
    }

    if (!githubLink || !githubLink.trim()) {
      return NextResponse.json(
        { success: false, error: 'GitHub link is required' },
        { status: 400 }
      );
    }

    let sanitizedYoutube = '';
    let sanitizedLeetcode = '';
    let sanitizedGithub = '';
    let sanitizedThumbnail = '';

    try {
      const validateHttpUrl = (value: string) => {
        const trimmed = value.trim();
        new URL(trimmed);
        return trimmed;
      };

      const sanitizeThumbnail = (value: string) => {
        const trimmed = value.trim();
        if (trimmed.startsWith('data:image')) {
          return trimmed;
        }
        new URL(trimmed);
        return trimmed;
      };

      sanitizedYoutube = validateHttpUrl(youtubeLink);
      sanitizedLeetcode = validateHttpUrl(leetcodeLink);
      sanitizedGithub = validateHttpUrl(githubLink);
      sanitizedThumbnail = sanitizeThumbnail(thumbnailUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE posts
       SET problem_name = $1,
           difficulty = $2,
           post_date = $3,
           thumbnail_url = $4,
           youtube_link = $5,
           lc_daily_link = $6,
           github_link = $7,
           motivational_quote = $8,
           tags = $9,
           extra_links = $10,
           updated_at = NOW()
       WHERE id = $11
       RETURNING id, problem_name, difficulty, post_date, thumbnail_url,
                 youtube_link, lc_daily_link, github_link,
                 motivational_quote, tags, extra_links, created_at`,
      [
        problemName.trim(),
        difficulty,
        postDate,
        sanitizedThumbnail,
        sanitizedYoutube,
        sanitizedLeetcode,
        sanitizedGithub,
        motivationalQuote?.trim() || null,
        JSON.stringify(Array.isArray(tags) ? tags : []),
        JSON.stringify(optionalLinks || []),
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    await query(
      `INSERT INTO daily_problems (problem_date, post_id)
       VALUES ($1, $2)
       ON CONFLICT (problem_date) DO UPDATE SET post_id = $2`,
      [postDate, id]
    );

    return NextResponse.json(
      { success: true, post: mapRowToPost(result.rows[0]) },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update post error:', error);

    if (error?.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'A post already exists for the selected date' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
