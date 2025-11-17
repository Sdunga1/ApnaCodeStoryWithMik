import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { extractTokenFromHeader, verifyToken } from '@/lib/jwt';
import { formatUser } from '@/lib/user';

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  }

  const payload = verifyToken(token);

  if (!payload) {
    return { error: NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 }) };
  }

  return { userId: payload.userId };
}

async function fetchUser(userId: string) {
  const result = await query(
    `SELECT id, name, email, role, username, bio, location, website_url, twitter_handle, avatar_url
     FROM users
     WHERE id = $1 AND is_deleted = FALSE`,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request);
    if ('error' in auth) return auth.error;

    const userRow = await fetchUser(auth.userId);
    if (!userRow) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: formatUser(userRow) }, { status: 200 });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const {
      name,
      username,
      bio,
      location,
      websiteUrl,
      twitterHandle,
      avatarData,
    } = body ?? {};

    const updates: string[] = [];
    const values: any[] = [];

    const pushValue = (value: any, column: string) => {
      values.push(value);
      updates.push(`${column} = $${values.length}`);
    };

    if (typeof name === 'string') {
      const trimmed = name.trim();
      if (trimmed && trimmed.length >= 2) {
        pushValue(trimmed, 'name');
      } else {
        return NextResponse.json(
          { success: false, error: 'Name must be at least 2 characters' },
          { status: 400 }
        );
      }
    }

    if (typeof username === 'string') {
      const normalized = username.trim().toLowerCase();
      if (normalized.length === 0) {
        pushValue(null, 'username');
      } else {
        const usernameRegex = /^[a-z0-9._-]{3,24}$/;
        if (!usernameRegex.test(normalized)) {
          return NextResponse.json(
            {
              success: false,
              error: 'Username must be 3-24 characters and may contain letters, numbers, dots, underscores, or hyphens',
            },
            { status: 400 }
          );
        }
        pushValue(normalized, 'username');
      }
    }

    if (typeof bio === 'string') {
      const trimmed = bio.trim();
      if (trimmed.length > 280) {
        return NextResponse.json(
          { success: false, error: 'Bio must be 280 characters or less' },
          { status: 400 }
        );
      }
      pushValue(trimmed || null, 'bio');
    }

    if (typeof location === 'string') {
      const trimmed = location.trim();
      if (trimmed.length > 120) {
        return NextResponse.json(
          { success: false, error: 'Location must be 120 characters or less' },
          { status: 400 }
        );
      }
      pushValue(trimmed || null, 'location');
    }

    if (typeof websiteUrl === 'string') {
      const trimmed = websiteUrl.trim();
      if (trimmed.length === 0) {
        pushValue(null, 'website_url');
      } else {
        try {
          const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
          pushValue(parsed.toString(), 'website_url');
        } catch {
          return NextResponse.json(
            { success: false, error: 'Website URL is invalid' },
            { status: 400 }
          );
        }
      }
    }

    if (typeof twitterHandle === 'string') {
      const trimmed = twitterHandle.trim().replace(/^@/, '');
      if (trimmed.length === 0) {
        pushValue(null, 'twitter_handle');
      } else {
        const handleRegex = /^[A-Za-z0-9_]{1,15}$/;
        if (!handleRegex.test(trimmed)) {
          return NextResponse.json(
            { success: false, error: 'Twitter handle must be 1-15 letters, numbers, or underscores' },
            { status: 400 }
          );
        }
        pushValue(trimmed, 'twitter_handle');
      }
    }

    if (typeof avatarData === 'string') {
      const trimmed = avatarData.trim();
      if (trimmed.length === 0) {
        pushValue(null, 'avatar_url');
      } else if (!trimmed.startsWith('data:image')) {
        return NextResponse.json(
          { success: false, error: 'Avatar must be a base64 data URL' },
          { status: 400 }
        );
      } else if (trimmed.length > 1_500_000) {
        return NextResponse.json(
          { success: false, error: 'Avatar file is too large (max ~1.5MB)' },
          { status: 400 }
        );
      } else {
        pushValue(trimmed, 'avatar_url');
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No profile fields provided' },
        { status: 400 }
      );
    }

    values.push(auth.userId);
    await query(
      `UPDATE users
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}`,
      values
    );

    const updatedUser = await fetchUser(auth.userId);
    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: formatUser(updatedUser) }, { status: 200 });
  } catch (error: any) {
    if (error?.code === '23505') {
      return NextResponse.json({ success: false, error: 'Username is already taken' }, { status: 409 });
    }
    console.error('Profile PUT error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

