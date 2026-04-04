-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id BIGSERIAL PRIMARY KEY,
    auth_id TEXT UNIQUE NOT NULL, -- auth.uid() or Auth0 ID
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    gender TEXT NOT NULL,
    marital_status TEXT NOT NULL,
    height TEXT NOT NULL,
    weight TEXT NOT NULL,
    colour TEXT NOT NULL,
    birth JSONB NOT NULL,
    professional JSONB NOT NULL,
    family JSONB NOT NULL,
    astro JSONB NOT NULL,
    profile_img TEXT[] DEFAULT '{}',
    profile_id TEXT UNIQUE NOT NULL,
    created_on TIMESTAMPTZ DEFAULT NOW()
);

-- Interests Table
CREATE TABLE IF NOT EXISTS interests (
    id BIGSERIAL PRIMARY KEY,
    sender_id TEXT NOT NULL, -- auth_id
    receiver_id TEXT NOT NULL, -- auth_id
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid()::text = auth_id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid()::text = auth_id);

-- Policies for Interests
CREATE POLICY "Users can view their own interests" 
ON interests FOR SELECT 
USING (auth.uid()::text = sender_id OR auth.uid()::text = receiver_id);

CREATE POLICY "Users can send interests" 
ON interests FOR INSERT 
WITH CHECK (auth.uid()::text = sender_id);

CREATE POLICY "Receiver can update interest status" 
ON interests FOR UPDATE 
USING (auth.uid()::text = receiver_id);
