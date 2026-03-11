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
  return 's' + Date.now().toString(36);
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
  },

  updateContent(id, data) {
    const index = content.findIndex(c => c.id === id);
    if (index === -1) return null;
    const duration = data.duration !== undefined ? Number(data.duration) : content[index].duration;
    const updated = {
      ...content[index],
      title: data.title !== undefined ? data.title : content[index].title,
      type: data.type !== undefined ? data.type : content[index].type,
      url: data.url !== undefined ? data.url : content[index].url,
      duration: (!isNaN(duration) && duration >= 0) ? duration : content[index].duration,
      updatedAt: new Date().toISOString()
    };
    content[index] = updated;
    return updated;
  }
};

module.exports = streamingEngine;
