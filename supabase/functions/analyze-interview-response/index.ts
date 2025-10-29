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