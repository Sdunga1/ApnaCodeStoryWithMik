export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: 'creator' | 'student';
  username: string | null;
  bio: string | null;
  location: string | null;
  website_url: string | null;
  twitter_handle: string | null;
  avatar_url: string | null;
}

export function formatUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    username: row.username,
    bio: row.bio,
    location: row.location,
    websiteUrl: row.website_url,
    twitterHandle: row.twitter_handle,
    avatarUrl: row.avatar_url,
  };
}

