<<<<<<< HEAD
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
=======
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, jobDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing resume with AI...");

    // Call Lovable AI for ATS scoring and analysis
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert ATS (Applicant Tracking System) analyzer. Analyze resumes and provide:
1. ATS score (0-100) based on keywords, formatting, and structure
2. Keyword match percentage with job description (if provided)
3. Specific suggestions for improvement
4. Missing keywords that should be added

Return ONLY valid JSON in this exact format:
{
  "atsScore": number,
  "keywordMatch": number,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "missingKeywords": ["keyword1", "keyword2"]
}`
          },
          {
            role: "user",
            content: `Resume Content:\n${resumeText}\n\n${
              jobDescription ? `Job Description:\n${jobDescription}` : ""
            }\n\nProvide ATS analysis in JSON format.`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const error = await response.text();
      console.error("AI API error:", error);
      throw new Error("Failed to analyze resume");
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;

    if (!analysisText) {
      throw new Error("No analysis returned from AI");
    }

    // Parse the JSON response
    const analysis = JSON.parse(analysisText.trim());

    console.log("Resume analysis complete:", analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in analyze-resume function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to analyze resume" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
>>>>>>> 801a78b4be3b2ddaf9b88c0f194248ff0db89c44
