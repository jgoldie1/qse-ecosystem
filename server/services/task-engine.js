/**
 * Task Engine - Manages tasks across the QSE Ecosystem
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../../data/tasks.json');

function load() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function save(tasks) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(tasks, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const taskEngine = {
  getAll() {
    return load();
  },

  create(data) {
    const tasks = load();
    const task = {
      id: generateId(),
      title: data.title || 'Untitled Task',
      description: data.description || '',
      status: 'pending',
      userId: data.userId || null,
      app: data.app || 'general',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(task);
    save(tasks);
    return task;
  },

  update(id, data) {
    const tasks = load();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], ...data, id, updatedAt: new Date().toISOString() };
    save(tasks);
    return tasks[index];
  },

  remove(id) {
    const tasks = load();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    const [removed] = tasks.splice(index, 1);
    save(tasks);
    return removed;
  }
};

module.exports = taskEngine;
