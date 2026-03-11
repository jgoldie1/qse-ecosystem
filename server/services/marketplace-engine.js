/**
 * Marketplace Engine - Handles product listings across QSE apps
 */

const listings = [
  { id: 'm1', title: 'Sculptify Training Package', app: 'sculptify', price: 99, currency: 'USD', seller: 'sculptify', available: true },
  { id: 'm2', title: 'Wellness Starter Kit', app: 'sculptify', price: 49, currency: 'USD', seller: 'sculptify', available: true },
  { id: 'm3', title: 'Resume Review Service', app: 'marchLewis', price: 25, currency: 'USD', seller: 'marchLewis', available: true },
  { id: 'm4', title: 'Career Coaching Session', app: 'marchLewis', price: 75, currency: 'USD', seller: 'marchLewis', available: true }
];

function generateId() {
  return 'm' + Date.now().toString(36);
}

const marketplaceEngine = {
  getListings(filter) {
    let results = listings.filter(l => l.available);
    if (filter && filter.app) {
      results = results.filter(l => l.app === filter.app);
    }
    return results;
  },

  getById(id) {
    return listings.find(l => l.id === id) || null;
  },

  addListing(data) {
    const listing = {
      id: generateId(),
      title: data.title || 'Untitled',
      app: data.app || 'general',
      price: data.price || 0,
      currency: data.currency || 'USD',
      seller: data.seller || 'unknown',
      available: true,
      createdAt: new Date().toISOString()
    };
    listings.push(listing);
    return listing;
  }
};

module.exports = marketplaceEngine;
