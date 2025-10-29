-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  professional_title TEXT,
  target_industry TEXT,
  years_of_experience INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  file_url TEXT,
  ats_score INTEGER,
  job_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interviews table
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  industry TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  job_description TEXT,
  status TEXT DEFAULT 'in_progress',
  overall_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview questions table
CREATE TABLE IF NOT EXISTS public.interview_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_order INTEGER NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview responses table
CREATE TABLE IF NOT EXISTS public.interview_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES public.interview_questions(id) ON DELETE CASCADE,
  response_text TEXT,
  recording_url TEXT,
  score INTEGER,
  ai_feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_responses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Resumes policies
CREATE POLICY "Users can view own resumes" ON public.resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create resumes" ON public.resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON public.resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON public.resumes
  FOR DELETE USING (auth.uid() = user_id);

-- Interviews policies
CREATE POLICY "Users can view own interviews" ON public.interviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create interviews" ON public.interviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interviews" ON public.interviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Interview questions policies
CREATE POLICY "Users can view questions from own interviews" ON public.interview_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.interviews
      WHERE interviews.id = interview_questions.interview_id
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create questions for own interviews" ON public.interview_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interviews
      WHERE interviews.id = interview_questions.interview_id
      AND interviews.user_id = auth.uid()
    )
  );

-- Interview responses policies
CREATE POLICY "Users can view responses from own interviews" ON public.interview_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.interview_questions
      JOIN public.interviews ON interviews.id = interview_questions.interview_id
      WHERE interview_questions.id = interview_responses.question_id
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create responses for own interviews" ON public.interview_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interview_questions
      JOIN public.interviews ON interviews.id = interview_questions.interview_id
      WHERE interview_questions.id = interview_responses.question_id
      AND interviews.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX idx_interviews_user_id ON public.interviews(user_id);
CREATE INDEX idx_interview_questions_interview_id ON public.interview_questions(interview_id);
CREATE INDEX idx_interview_responses_question_id ON public.interview_responses(question_id);

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resumes bucket
CREATE POLICY "Users can upload own resumes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own resumes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own resumes"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own resumes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );