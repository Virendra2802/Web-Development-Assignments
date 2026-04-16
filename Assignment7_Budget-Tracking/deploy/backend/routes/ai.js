const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

console.log('✦ AI Route Loaded. Key status:', process.env.GROQ_API_KEY ? 'Present' : 'MISSING');

router.post('/generate-tips', async (req, res) => {
  console.log('✦ AI Request: Processing tips for user transactions...');
  const { transactions, budgets } = req.body;

  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is missing in backend .env');
    }

    const prompt = `
      You are a smart financial advisor. Analyze these 15 transactions and user budgets.
      Suggest 3-4 ultra-short tips. Be witty and specific.
      Return EXCLUSIVELY a JSON array of objects.
      Schema: [{"type": "string", "text": "html string", "icon": "emoji", "cls": "tip-green|tip-blue|tip-amber|tip-purple"}]
      
      DATA: ${JSON.stringify({ transactions: transactions.slice(0, 15), budgets })}
    `;

    console.log('✦ AI Request: Sending prompt to Groq...');
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You only output valid JSON arrays. Never include conversational text outside the JSON.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    console.log('✦ AI Request: Received response from Groq');
    let content = chatCompletion.choices[0].message.content.trim();
    
    // Safety check for common AI JSON wrapping
    if (content.startsWith('```json')) content = content.replace(/```json|```/g, '').trim();
    
    const parsed = JSON.parse(content);
    const finalTips = Array.isArray(parsed) ? parsed : (parsed.tips || parsed.insights || []);
    
    console.log(`✦ AI Request: Success! Sending ${finalTips.length} tips to frontend.`);
    res.json(finalTips);
  } catch (err) {
    console.error('!!! AI Request FAILED:', err.message);
    if (err.response) console.error('!!! Groq API Details:', err.response.data);
    res.status(500).json({ msg: 'AI analysis failed', error: err.message });
  }
});

module.exports = router;
