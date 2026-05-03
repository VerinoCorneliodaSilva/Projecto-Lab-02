-- Create article_summaries table for caching AI summaries
CREATE TABLE article_summaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url_hash TEXT UNIQUE NOT NULL,
  article_url TEXT NOT NULL,
  article_title TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create saved_articles table
CREATE TABLE saved_articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_url TEXT NOT NULL,
  article_title TEXT NOT NULL,
  article_data JSONB NOT NULL,
  saved_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE article_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_articles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for saved_articles
CREATE POLICY "Users can view their own saved articles" ON saved_articles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert saved articles" ON saved_articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved articles" ON saved_articles
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for article_summaries (public read access)
CREATE POLICY "Anyone can view cached summaries" ON article_summaries
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert summaries" ON article_summaries
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_article_summaries_url_hash ON article_summaries(url_hash);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_saved_articles_user_id ON saved_articles(user_id);
