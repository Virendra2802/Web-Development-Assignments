const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Utilize Google Gemini Free API if configured
    if (process.env.GEMINI_API_KEY) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are AxiaBot, a highly intelligent financial assistant seamlessly integrated into the Axia Finance dashboard. Be concise, professional, and directly helpful with investments, budgeting, and market knowledge. Please reply to the user's message below:\n\nUser: ${message}`
            }]
          }]
        })
      });
      const data = await response.json();
      
      if (data.error) {
        return res.json({ reply: `⚠️ [API ERROR]: Your Gemini key was rejected. ${data.error.message}` });
      }
      
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that response.";
      return res.json({ reply: replyText });
    }

    // Fallback logic if no API Key provided
    const lower = message.toLowerCase();
    
    // Explicitly let user know we are hitting the offline script
    let reply = "⚠️ [OFFLINE MOCK MODE]: I am currently running without a GEMINI_API_KEY. I cannot answer properly right now. Please add your free Google AI key to the backend .env file!";
    
    if (lower.includes('invest') || lower.includes('stock')) {
      reply = "🤖 [MOCK REPLY]: When investing, diversification is absolutely key! Make sure your portfolio is balanced across multiple sectors. (Add API Key to get real answers!)";
    } else if (lower.includes('budget') || lower.includes('save') || lower.includes('saving')) {
      reply = "🤖 [MOCK REPLY]: Sticking to the 50/30/20 rule is a great baseline way to manage your budget: 50% for needs, 30% for wants, and 20% strictly for savings. (Add API Key to get real answers!)";
    } else if (/\b(hello|hi|hey)\b/.test(lower)) {
      reply = "🤖 [MOCK REPLY]: Hello there! (I am running in offline mode. Add a GEMINI_API_KEY to the backend to wake me up!)";
    }

    // Artificial delay to simulate thinking for fallback mode
    setTimeout(() => {
      res.json({ reply });
    }, 1000);

  } catch (err) {
    console.error('Chat error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

module.exports = router;
