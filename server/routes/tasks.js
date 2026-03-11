const express = require('express');
const router = express.Router();
const taskEngine = require('../services/task-engine');

router.get('/', (req, res) => {
  const tasks = taskEngine.getAll();
  res.json(tasks);
});

router.post('/', (req, res) => {
  const task = taskEngine.create(req.body);
  res.status(201).json(task);
});

router.put('/:id', (req, res) => {
  const task = taskEngine.update(req.params.id, req.body);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

router.delete('/:id', (req, res) => {
  const removed = taskEngine.remove(req.params.id);
  if (!removed) return res.status(404).json({ error: 'Task not found' });
  res.json({ success: true });
});

module.exports = router;
