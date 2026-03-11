/**
 * Training Engine - Manages courses and enrollment across QSE apps
 */

const courses = [
  { id: 'c1', title: 'Body Sculpting Fundamentals', app: 'sculptify', category: 'fitness', duration: '4 weeks', price: 0 },
  { id: 'c2', title: 'Advanced Nutrition Planning', app: 'sculptify', category: 'nutrition', duration: '2 weeks', price: 0 },
  { id: 'c3', title: 'Resume Writing Workshop', app: 'marchLewis', category: 'career', duration: '1 week', price: 0 },
  { id: 'c4', title: 'Interview Mastery', app: 'marchLewis', category: 'career', duration: '2 weeks', price: 0 },
  { id: 'c5', title: 'Digital Marketing Basics', app: 'general', category: 'business', duration: '3 weeks', price: 0 }
];

const enrollments = {};

const trainingEngine = {
  getCourses(filter) {
    if (filter && filter.app) {
      return courses.filter(c => c.app === filter.app || c.app === 'general');
    }
    return courses;
  },

  getCourseById(courseId) {
    return courses.find(c => c.id === courseId) || null;
  },

  enroll(userId, courseId) {
    const course = this.getCourseById(courseId);
    if (!course) return { success: false, error: 'Course not found' };

    if (!enrollments[userId]) enrollments[userId] = [];

    const existing = enrollments[userId].find(e => e.courseId === courseId);
    if (existing) return { success: false, error: 'Already enrolled' };

    const enrollment = {
      userId,
      courseId,
      course,
      progress: 0,
      enrolledAt: new Date().toISOString()
    };
    enrollments[userId].push(enrollment);
    return { success: true, enrollment };
  },

  getProgress(userId) {
    return enrollments[userId] || [];
  }
};

module.exports = trainingEngine;
