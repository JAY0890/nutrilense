import 'dotenv/config'
import Express from 'express'
import multer from 'multer'

import {extractText} from './services/ocr.service.js'

const app=Express()
const upload=multer({storage: multer.memoryStorage()})

app.post("/api/sendimage",upload.single('image'), async (req,res)=>{

    if(!req.file){
        return res.status(400).json({error:"no image found"}) 
    }

    try {
    const text = await extractText(req.file.buffer)
    res.json({ extractedText: text })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: "OCR failed" })
  }
})

app.listen(3000)