<<<<<<< HEAD
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumeText, jobDescription, targetImprovement } = await req.json()

    if (!resumeText) {
      throw new Error('Resume text is required')
    }

    const improvements = []
    const addedKeywords = []

    // Analyze resume sections
    const hasSummary = /summary|objective|profile/i.test(resumeText)
    const hasExperience = /experience|work history|employment/i.test(resumeText)
    const hasEducation = /education|degree|university|college/i.test(resumeText)
    const hasSkills = /skills|competencies|expertise/i.test(resumeText)

    // Generate improvements
    if (!hasSummary) {
      improvements.push("Add a professional summary at the top highlighting your key achievements and career goals")
    }

    if (!hasExperience) {
      improvements.push("Include a detailed work experience section with bullet points describing your accomplishments")
    }

    if (!hasEducation) {
      improvements.push("Add your educational background including degrees, institutions, and graduation dates")
    }

    if (!hasSkills) {
      improvements.push("Create a skills section listing your technical and soft skills relevant to the position")
    }

    // Action verb suggestions
    const weakVerbs = ['did', 'made', 'worked on', 'was responsible for']
    const hasWeakVerbs = weakVerbs.some(verb => resumeText.toLowerCase().includes(verb))
    
    if (hasWeakVerbs) {
      improvements.push("Replace weak verbs with strong action verbs like 'Led', 'Developed', 'Implemented', 'Achieved', 'Optimized'")
    }

    // Quantification check
    const hasNumbers = /\d+%|\d+\+|\$\d+|increased|decreased|reduced|improved/i.test(resumeText)
    if (!hasNumbers) {
      improvements.push("Quantify your achievements with metrics (e.g., 'Increased sales by 30%', 'Reduced costs by $50K')")
    }

    // Keyword optimization from job description
    if (jobDescription) {
      const jdKeywords = extractImportantWords(jobDescription)
      const missingKeywords = jdKeywords.filter(kw => 
        !resumeText.toLowerCase().includes(kw.toLowerCase())
      )
      
      if (missingKeywords.length > 0) {
        addedKeywords.push(...missingKeywords.slice(0, 8))
        improvements.push(`Incorporate these keywords from the job description: ${missingKeywords.slice(0, 5).join(', ')}`)
      }
    }

    // Format suggestions
    if (resumeText.length < 500) {
      improvements.push("Expand your resume to at least 500 words for better ATS compatibility")
    }

    if (resumeText.length > 3000) {
      improvements.push("Consider condensing your resume to 1-2 pages for better readability")
    }

    const response = {
      improvements: improvements.slice(0, 8),
      addedKeywords: addedKeywords.slice(0, 10),
      optimizedSections: {
        summary: hasSummary,
        experience: hasExperience,
        education: hasEducation,
        skills: hasSkills
      }
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

function extractImportantWords(text: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'])
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w))
  
  const frequency: { [key: string]: number } = {}
  words.forEach(w => frequency[w] = (frequency[w] || 0) + 1)
  
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word)
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
    const { resumeText, jobDescription, targetImprovement } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Optimizing resume with AI...");

    // Call Lovable AI for resume optimization
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
            content: `You are an expert resume writer and career coach. Optimize resumes to:
1. Improve ATS compatibility
2. Strengthen action verbs and quantifiable achievements
3. Add relevant keywords from job descriptions
4. Improve overall structure and readability
5. Maintain professional tone

Return suggestions in JSON format with the exact structure:
{
  "optimizedSections": {
    "summary": "improved professional summary",
    "experience": ["improved bullet point 1", "improved bullet point 2"],
    "skills": ["improved skill list"]
  },
  "addedKeywords": ["keyword1", "keyword2"],
  "improvements": ["specific improvement 1", "specific improvement 2"]
}`
          },
          {
            role: "user",
            content: `Resume Content:\n${resumeText}\n\n${
              jobDescription ? `Target Job Description:\n${jobDescription}` : ""
            }\n\n${
              targetImprovement ? `Focus Area: ${targetImprovement}` : ""
            }\n\nProvide optimization suggestions in JSON format.`
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
      throw new Error("Failed to optimize resume");
    }

    const data = await response.json();
    const optimizationText = data.choices?.[0]?.message?.content;

    if (!optimizationText) {
      throw new Error("No optimization returned from AI");
    }

    // Parse the JSON response
    const optimization = JSON.parse(optimizationText.trim());

    console.log("Resume optimization complete");

    return new Response(JSON.stringify(optimization), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in optimize-resume function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to optimize resume" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
>>>>>>> 801a78b4be3b2ddaf9b88c0f194248ff0db89c44
