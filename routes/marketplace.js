const express = require('express');
const router = express.Router();
const marketplaceEngine = require('../core/marketplace-engine');

router.get('/listings', (req, res) => {
  const listings = marketplaceEngine.getListings(req.query.app ? { app: req.query.app } : undefined);
  res.json(listings);
});

router.get('/listings/:id', (req, res) => {
  const listing = marketplaceEngine.getById(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  res.json(listing);
});

router.post('/listings', (req, res) => {
  const { title, app, price, currency, seller } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }
  const listing = marketplaceEngine.addListing({ title, app, price, currency, seller });
  res.status(201).json(listing);
});

module.exports = router;
