import axios from 'axios'

const API_KEY = process.env.GEMINI_API_KEY
const MODEL = 'gemini-2.5-flash'

const SYSTEM_PROMPT = `You are a nutrition label analyzer. You will receive raw OCR-extracted text from a food product label. Analyze it and respond ONLY with valid JSON, no other text, in this exact shape:

{
  "productName": string or null,
  "ingredients": string[],
  "allergens": string[],
  "benefits": string[],
  "harms": string[],
  "summary": string (2-3 sentences, plain language)
}

If the text is too garbled or incomplete to analyze, still return this shape with empty arrays and an explanatory summary.`

export async function analyzeLabel(ocrText) {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      contents: [
        { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nLabel text:\n\n${ocrText}` }] }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    },
    { headers: { 'Content-Type': 'application/json' } }
  )

  const rawText = response.data.candidates[0].content.parts[0].text

  try {
    return JSON.parse(rawText)
  } catch (err) {
    throw new Error('AI response was not valid JSON: ' + rawText.slice(0, 200))
  }
}