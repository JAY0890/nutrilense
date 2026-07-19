import 'dotenv/config'
import Express from 'express'
import multer from 'multer'

import { extractText } from './services/ocr.service.js'
import { analyzeLabel } from './services/ai.service.js'

const app = Express()
const upload = multer({ storage: multer.memoryStorage() })

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

app.listen(3000)