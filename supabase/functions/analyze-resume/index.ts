import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumeText, jobDescription } = await req.json()

    if (!resumeText) {
      throw new Error('Resume text is required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Simple keyword-based ATS scoring (replace with AI API call if needed)
    const keywords = jobDescription 
      ? extractKeywords(jobDescription) 
      : ['experience', 'skills', 'education', 'projects', 'achievements']

    const resumeLower = resumeText.toLowerCase()
    const matchedKeywords = keywords.filter(k => resumeLower.includes(k.toLowerCase()))
    const atsScore = Math.min(Math.round((matchedKeywords.length / keywords.length) * 100), 100)

    // Analyze resume structure
    const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resumeText)
    const hasPhone = /(\+\d{1,3}[- ]?)?\d{10}/.test(resumeText)
    const wordCount = resumeText.split(/\s+/).length

    const strengths = []
    const weaknesses = []

    if (hasEmail) strengths.push("Contact information is present")
    else weaknesses.push("Missing email address")

    if (hasPhone) strengths.push("Phone number included")
    else weaknesses.push("Missing phone number")

    if (wordCount > 200) strengths.push("Sufficient content length")
    else weaknesses.push("Resume content is too brief")

    if (matchedKeywords.length > keywords.length * 0.5) {
      strengths.push("Good keyword match with job description")
    } else {
      weaknesses.push("Low keyword match - add more relevant skills")
    }

    const response = {
      atsScore,
      keywordMatch: Math.round((matchedKeywords.length / keywords.length) * 100),
      strengths,
      weaknesses,
      matchedKeywords: matchedKeywords.slice(0, 10),
      missingKeywords: keywords.filter(k => !matchedKeywords.includes(k)).slice(0, 10)
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

function extractKeywords(text: string): string[] {
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node', 'sql', 'aws',
    'leadership', 'communication', 'teamwork', 'project management',
    'agile', 'scrum', 'git', 'docker', 'kubernetes'
  ]
  
  const textLower = text.toLowerCase()
  const found = commonSkills.filter(skill => textLower.includes(skill))
  
  return found.length > 0 ? found : commonSkills.slice(0, 10)
}