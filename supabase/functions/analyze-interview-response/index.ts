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
    const { question, response, category } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing interview response with AI...");

    // Call Lovable AI for response analysis
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are an expert interview coach. Analyze interview responses and provide:
1. Overall score (0-100)
2. Strengths in the response
3. Areas for improvement
4. Specific, actionable feedback
5. Suggested improvements to the answer

For behavioral questions, check for STAR method (Situation, Task, Action, Result).
For technical questions, assess accuracy and depth.

Return ONLY valid JSON in this exact format:
{
  "score": number,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "feedback": "detailed paragraph of feedback",
  "suggestedAnswer": "improved version of the answer"
}`
          },
          {
            role: "user",
            content: `Question: ${question}
Category: ${category}
Candidate Response: ${response}

Analyze this response and provide feedback in JSON format.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const error = await aiResponse.text();
      console.error("AI API error:", error);
      throw new Error("Failed to analyze response");
    }

    const data = await aiResponse.json();
    const analysisText = data.choices?.[0]?.message?.content;

    if (!analysisText) {
      throw new Error("No analysis returned from AI");
    }

    // Parse the JSON response
    const analysis = JSON.parse(analysisText.trim());

    console.log("Interview response analyzed, score:", analysis.score);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in analyze-interview-response function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to analyze response" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
