const express = require('express');
const router = express.Router();
const trainingEngine = require('../core/training-engine');

router.get('/courses', (req, res) => {
  const courses = trainingEngine.getCourses(req.query.app ? { app: req.query.app } : undefined);
  res.json(courses);
});

router.post('/enroll', (req, res) => {
  const { userId, courseId } = req.body;
  if (!userId || !courseId) {
    return res.status(400).json({ error: 'userId and courseId are required' });
  }
  const result = trainingEngine.enroll(userId, courseId);
  res.status(201).json(result);
});

router.get('/progress/:userId', (req, res) => {
  const progress = trainingEngine.getProgress(req.params.userId);
  res.json(progress);
});

module.exports = router;
