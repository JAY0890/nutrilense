import 'dotenv/config'
import Express from 'express'
import multer from 'multer'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import { extractText } from './services/ocr.service.js'
import { analyzeLabel } from './services/ai.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = Express()
const upload = multer({ storage: multer.memoryStorage() })

// Serve frontend static files
app.use(Express.static(join(__dirname, '..', 'frontend')))

app.post("/api/sendimage", upload.single('image'), async (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: "no image found" })
  }

  try {
    const extractedText = await extractText(req.file.buffer)

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(422).json({ error: "Could not read any text from the image" })
    }

    const analysis = await analyzeLabel(extractedText)

    res.json({ extractedText, analysis })

  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: "Processing failed" })
  }
})

app.listen(3000, () => {
  console.log('🔬 NutriLense running at http://localhost:3000')
})