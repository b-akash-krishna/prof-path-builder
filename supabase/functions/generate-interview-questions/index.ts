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