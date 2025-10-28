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
