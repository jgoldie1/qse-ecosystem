const express = require('express');
const router = express.Router();
const streamingEngine = require('../core/streaming-engine');

router.get('/content', (req, res) => {
  const content = streamingEngine.getContent(req.query);
  res.json(content);
});

router.post('/content', (req, res) => {
  const item = streamingEngine.addContent(req.body);
  res.status(201).json(item);
});

router.get('/content/:id', (req, res) => {
  const item = streamingEngine.getById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Content not found' });
  res.json(item);
});

router.put('/content/:id', (req, res) => {
  const item = streamingEngine.updateContent(req.params.id, req.body);
  if (!item) return res.status(404).json({ error: 'Content not found' });
  res.json(item);
});

module.exports = router;
