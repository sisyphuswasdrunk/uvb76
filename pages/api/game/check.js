export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phraseId, guess } = req.body;
  
  if (!phraseId || typeof guess !== 'boolean') {
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  // проверка по ID
  const isRealPhrase = phraseId.startsWith('real_');
  const correct = isRealPhrase === guess;
  
  res.status(200).json({
    correct,
    isReal: isRealPhrase
  });
}