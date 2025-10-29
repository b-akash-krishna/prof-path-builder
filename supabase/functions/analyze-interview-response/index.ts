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
    const { question, response, category } = await req.json()

    if (!question || !response) {
      throw new Error('Question and response are required')
    }

    const analysis = analyzeResponse(question, response, category)

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

function analyzeResponse(question: string, response: string, category: string) {
  let score = 60 // Base score
  const feedback = []
  const strengths = []
  const improvements = []

  // Check response length
  const wordCount = response.split(/\s+/).length
  if (wordCount < 50) {
    score -= 15
    improvements.push("Your response is too brief. Aim for 100-200 words to provide sufficient detail.")
  } else if (wordCount > 300) {
    score -= 5
    improvements.push("Consider being more concise. Long responses can lose the interviewer's attention.")
  } else {
    score += 10
    strengths.push("Good response length - detailed but concise.")
  }

  // Check for STAR method (Situation, Task, Action, Result)
  if (category === 'Behavioral') {
    const hasSituation = /situation|context|when|where/i.test(response)
    const hasTask = /task|goal|objective|needed to/i.test(response)
    const hasAction = /i (did|implemented|created|developed|led|managed)|action|approach/i.test(response)
    const hasResult = /result|outcome|achieved|improved|increased|decreased/i.test(response)

    const starCount = [hasSituation, hasTask, hasAction, hasResult].filter(Boolean).length
    score += starCount * 5

    if (starCount >= 3) {
      strengths.push("Excellent use of the STAR method to structure your response.")
    } else {
      improvements.push("Use the STAR method: Describe the Situation, Task, Action you took, and Results achieved.")
    }
  }

  // Check for specificity
  const hasNumbers = /\d+%|\d+ (months|years|weeks|days)|\$\d+|increased|decreased|reduced/i.test(response)
  const hasSpecificExamples = /for example|specifically|in particular|such as/i.test(response)

  if (hasNumbers) {
    score += 10
    strengths.push("Great use of quantifiable metrics to demonstrate impact.")
  } else {
    improvements.push("Add specific numbers or metrics to make your achievements more tangible.")
  }

  if (hasSpecificExamples) {
    score += 5
    strengths.push("Specific examples make your response more credible.")
  }

  // Check for positive tone
  const negativeWords = /failed|couldn't|impossible|never|hate|worst/gi
  const negativeCount = (response.match(negativeWords) || []).length
  
  if (negativeCount > 2) {
    score -= 10
    improvements.push("Frame challenges in a more positive light, focusing on what you learned and achieved.")
  }

  // Check for first-person usage (shows ownership)
  const firstPersonCount = (response.match(/\bi\b|\bmy\b|\bme\b/gi) || []).length
  if (firstPersonCount < 2) {
    score -= 5
    improvements.push("Use more first-person language (I, my) to show personal ownership of accomplishments.")
  } else {
    strengths.push("Good use of first-person to demonstrate ownership.")
  }

  // Check for action verbs
  const actionVerbs = /led|managed|developed|created|implemented|designed|improved|optimized|achieved|coordinated/gi
  const actionVerbCount = (response.match(actionVerbs) || []).length
  
  if (actionVerbCount >= 2) {
    score += 5
    strengths.push("Strong action verbs demonstrate proactive approach.")
  } else {
    improvements.push("Use more action verbs to show your direct contributions.")
  }

  // Ensure score is within bounds
  score = Math.max(40, Math.min(100, score))

  // Generate overall feedback
  let overallFeedback = ""
  if (score >= 85) {
    overallFeedback = "Excellent response! You provided a well-structured answer with specific examples and measurable results."
  } else if (score >= 70) {
    overallFeedback = "Good response with room for improvement. You covered the main points but could add more specific details."
  } else if (score >= 55) {
    overallFeedback = "Adequate response, but needs more structure and specific examples to be compelling."
  } else {
    overallFeedback = "Your response needs significant improvement. Focus on providing specific examples and using the STAR method."
  }

  if (improvements.length > 0) {
    overallFeedback += " " + improvements[0]
  }

  return {
    score,
    feedback: overallFeedback,
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    details: {
      wordCount,
      hasQuantifiableMetrics: hasNumbers,
      usesSTARMethod: category === 'Behavioral'
    }
  }
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
>>>>>>> 801a78b4be3b2ddaf9b88c0f194248ff0db89c44
