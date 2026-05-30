import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { env } from '../config/env.js'

let client = null

export function isGeminiConfigured() {
  return Boolean(env.GEMINI_API_KEY)
}

function getClient() {
  if (!isGeminiConfigured()) {
    const err = new Error('AI features are not configured')
    err.status = 503
    throw err
  }
  if (!client) {
    client = new GoogleGenerativeAI(env.GEMINI_API_KEY)
  }
  return client
}

/**
 * Call Gemini with a strict JSON response schema and a system instruction.
 * Returns the parsed JSON object. Throws if Gemini's response cannot be parsed
 * or the schema isn't enforced.
 */
export async function generateStructured({
  systemInstruction,
  userMessage,
  schema,
  model = 'gemini-2.5-flash',
  temperature = 0.2,
}) {
  const genAI = getClient()
  const m = genAI.getGenerativeModel({
    model,
    systemInstruction,
    generationConfig: {
      temperature,
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  })

  const result = await m.generateContent(userMessage)
  const text = result.response.text()

  try {
    return JSON.parse(text)
  } catch {
    const err = new Error('AI response was not valid JSON')
    err.status = 502
    throw err
  }
}

export { SchemaType }
