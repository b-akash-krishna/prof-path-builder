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
    const { role, industry, experienceLevel, jobDescription } = await req.json()

    if (!role || !industry || !experienceLevel) {
      throw new Error('Role, industry, and experience level are required')
    }

    const questions = generateQuestions(role, industry, experienceLevel, jobDescription)

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

function generateQuestions(role: string, industry: string, level: string, jd?: string) {
  const questions = []

  // Behavioral questions (universal)
  const behavioral = [
    "Tell me about a time when you faced a challenging problem at work. How did you approach it?",
    "Describe a situation where you had to work with a difficult team member. How did you handle it?",
    "Give me an example of a goal you set and how you achieved it.",
    "Tell me about a time when you failed. What did you learn from it?",
  ]

  // Technical/role-specific questions
  const technicalByRole: { [key: string]: string[] } = {
    'engineer': [
      `What are the key technical skills required for a ${role} in ${industry}?`,
      `Explain a complex technical concept from ${industry} in simple terms.`,
      "Walk me through your approach to debugging a production issue.",
    ],
    'manager': [
      "How do you prioritize tasks when managing multiple projects?",
      "Describe your leadership style and give an example of how it helped your team succeed.",
      "How do you handle underperforming team members?",
    ],
    'developer': [
      "What's your experience with modern development frameworks?",
      "How do you ensure code quality in your projects?",
      "Describe your approach to system design and architecture.",
    ]
  }

  // Industry-specific questions
  const industryQuestions: { [key: string]: string[] } = {
    'tech': [
      "How do you stay updated with the latest technology trends?",
      "Describe a project where you implemented a new technology.",
    ],
    'finance': [
      "How do you handle sensitive financial data?",
      "What's your experience with financial regulations and compliance?",
    ],
    'healthcare': [
      "How do you ensure patient data privacy and security?",
      "Describe your experience with healthcare systems and regulations.",
    ],
  }

  // Add behavioral questions
  questions.push(
    { text: behavioral[0], category: 'Behavioral' },
    { text: behavioral[1], category: 'Behavioral' }
  )

  // Add technical questions
  const roleKey = role.toLowerCase().includes('engineer') ? 'engineer' :
                  role.toLowerCase().includes('manager') ? 'manager' :
                  role.toLowerCase().includes('developer') ? 'developer' : 'engineer'
  
  if (technicalByRole[roleKey]) {
    questions.push(
      { text: technicalByRole[roleKey][0], category: 'Technical' },
      { text: technicalByRole[roleKey][1], category: 'Technical' }
    )
  }

  // Add industry-specific questions
  const industryKey = industry.toLowerCase()
  if (industryQuestions[industryKey]) {
    questions.push(
      { text: industryQuestions[industryKey][0], category: 'Industry-Specific' }
    )
  }

  // Add experience-level questions
  if (level === 'entry') {
    questions.push(
      { text: "What interests you most about this role and our company?", category: 'Motivation' },
      { text: "Where do you see yourself in 5 years?", category: 'Career Goals' }
    )
  } else if (level === 'senior' || level === 'lead') {
    questions.push(
      { text: "How do you mentor junior team members?", category: 'Leadership' },
      { text: "Describe a time when you made a strategic decision that impacted the team.", category: 'Strategic Thinking' }
    )
  }

  // Add situational questions
  questions.push(
    { text: "How would you handle a situation where you disagree with your manager?", category: 'Situational' },
    { text: behavioral[2], category: 'Behavioral' }
  )

  // If job description is provided, add a custom question
  if (jd && jd.length > 100) {
    questions.push({
      text: `Based on the job description, how does your experience align with the key requirements for this ${role} position?`,
      category: 'Job-Specific'
    })
  }

  return questions.slice(0, 10) // Return max 10 questions
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
    const { role, industry, experienceLevel, jobDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating interview questions with AI...");

    // Call Lovable AI for question generation
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
            content: `You are an expert technical interviewer. Generate realistic interview questions for the given role and industry. Include:
1. Behavioral questions (STAR method)
2. Technical/role-specific questions
3. Situational questions
4. Company culture fit questions

Generate 8-10 questions that are relevant, challenging, and appropriate for the experience level.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "text": "question text",
      "category": "behavioral" | "technical" | "situational" | "culture_fit",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}`
          },
          {
            role: "user",
            content: `Role: ${role}
Industry: ${industry}
Experience Level: ${experienceLevel}
${jobDescription ? `\nJob Description:\n${jobDescription}` : ""}

Generate interview questions in JSON format.`
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
      throw new Error("Failed to generate questions");
    }

    const data = await response.json();
    const questionsText = data.choices?.[0]?.message?.content;

    if (!questionsText) {
      throw new Error("No questions returned from AI");
    }

    // Parse the JSON response
    const result = JSON.parse(questionsText.trim());

    console.log("Interview questions generated:", result.questions.length);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in generate-interview-questions function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate questions" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
>>>>>>> 801a78b4be3b2ddaf9b88c0f194248ff0db89c44
