const express = require('express');
const router = express.Router();
const trainingEngine = require('../services/training-engine');

router.get('/courses', (req, res) => {
  const courses = trainingEngine.getCourses();
  res.json(courses);
});

router.post('/enroll', (req, res) => {
  const { userId, courseId } = req.body;
  if (!userId || !courseId) {
    return res.status(400).json({ error: 'userId and courseId are required' });
  }
  const result = trainingEngine.enroll(userId, courseId);
  if (!result.success) return res.status(400).json({ error: result.error });
  res.status(201).json(result);
});

router.get('/progress/:userId', (req, res) => {
  const progress = trainingEngine.getProgress(req.params.userId);
  res.json(progress);
});

module.exports = router;
