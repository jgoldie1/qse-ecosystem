/**
 * Streaming Engine - Manages streaming content for QSE apps
 */

const content = [
  { id: 's1', title: 'Morning Sculpt Session', type: 'video', app: 'sculptify', url: '/streams/morning-sculpt', duration: 30 },
  { id: 's2', title: 'Nutrition Deep Dive', type: 'video', app: 'sculptify', url: '/streams/nutrition', duration: 45 },
  { id: 's3', title: 'Career Coaching Live', type: 'video', app: 'marchLewis', url: '/streams/career-coaching', duration: 60 },
  { id: 's4', title: 'Employer Q&A Session', type: 'video', app: 'marchLewis', url: '/streams/employer-qa', duration: 30 }
];

function generateId() {
  return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const streamingEngine = {
  getContent(query) {
    let results = [...content];
    if (query && query.app) {
      results = results.filter(c => c.app === query.app);
    }
    if (query && query.type) {
      results = results.filter(c => c.type === query.type);
    }
    return results;
  },

  getById(id) {
    return content.find(c => c.id === id) || null;
  },

  addContent(data) {
    const item = {
      id: generateId(),
      title: data.title || 'Untitled',
      type: data.type || 'video',
      app: data.app || 'general',
      url: data.url || '',
      duration: data.duration || 0,
      createdAt: new Date().toISOString()
    };
    content.push(item);
    return item;
  }
};

module.exports = streamingEngine;
