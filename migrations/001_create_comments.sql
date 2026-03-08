-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Create index for faster querying by slug
CREATE INDEX IF NOT EXISTS idx_comments_slug ON comments(slug);