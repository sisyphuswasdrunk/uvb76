import { randomUUID } from 'crypto'; 
import { uvb76Phrases } from '../../../data/uvb76';
import { neuroPhrases } from '../../../data/neuro';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const phrases = [];
    
    uvb76Phrases.forEach((phrase) => {
  phrases.push({
    id: `real_${randomUUID()}`,
    text: phrase.trim()
  });
});

neuroPhrases.forEach((phrase) => {
  phrases.push({
    id: `fake_${randomUUID()}`,
    text: phrase.trim()
  });
});
    
    // перемешивание
    phrases.sort(() => Math.random() - 0.5);
    
    // -> id, text
    res.status(200).json({
      phrases: phrases.map(p => ({ id: p.id, text: p.text })),
      total: phrases.length
    });
  } catch (error) {
    console.error('Error loading phrases:', error);
    res.status(500).json({ error: 'Failed to load phrases' });
  }
}