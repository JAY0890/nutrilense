import axios from 'axios'

const ENDPOINT = process.env.AZURE_VISION_ENDPOINT
const KEY = process.env.AZURE_VISION_KEY

export async function extractText(imageBuffer) {
  // Step 1: submit the image for reading
  const submitRes = await axios.post(
    `${ENDPOINT}/vision/v3.2/read/analyze`,
    imageBuffer,
    {
      headers: {
        'Ocp-Apim-Subscription-Key': KEY,
        'Content-Type': 'application/octet-stream'
      }
    }
  )

  const operationUrl = submitRes.headers['operation-location']

  // Step 2: poll until the result is ready
  let result
  while (true) {
    await new Promise(r => setTimeout(r, 1000)) // wait 1s between polls

    const pollRes = await axios.get(operationUrl, {
      headers: { 'Ocp-Apim-Subscription-Key': KEY }
    })

    if (pollRes.data.status === 'succeeded') {
      result = pollRes.data
      break
    }
    if (pollRes.data.status === 'failed') {
      throw new Error('OCR analysis failed')
    }
    // else status is 'running' or 'notStarted' — keep polling
  }

  // Step 3: flatten all recognized lines into one string
  const lines = result.analyzeResult.readResults.flatMap(page =>
    page.lines.map(line => line.text)
  )

  return lines.join('\n')
}