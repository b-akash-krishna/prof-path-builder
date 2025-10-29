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
