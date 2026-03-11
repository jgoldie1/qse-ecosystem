/**
 * SEO Engine - Generates meta tags and SEO data for QSE web apps
 */

const seoConfig = {
  sculptify: {
    title: 'Sculptify - Beauty, Wellness & Training',
    description: 'Transform your body and mind with Sculptify. Book appointments, access training programs, and connect with wellness professionals.',
    keywords: 'fitness, beauty, wellness, training, body sculpting, health',
    ogImage: '/sculptify/og-image.png'
  },
  marchLewis: {
    title: 'March & Lewis - Career Staffing & Workforce',
    description: 'Connect employers with top talent. March & Lewis helps job seekers and businesses thrive through smart staffing solutions.',
    keywords: 'jobs, staffing, career, employment, workforce, hiring, recruitment',
    ogImage: '/march-lewis/og-image.png'
  },
  default: {
    title: 'QSE Ecosystem',
    description: 'Your unified platform for wellness, careers, and community.',
    keywords: 'qse, ecosystem, wellness, career, community',
    ogImage: '/og-image.png'
  }
};

const seoEngine = {
  getMeta(app) {
    return seoConfig[app] || seoConfig.default;
  },

  generateMetaTags(app) {
    const meta = this.getMeta(app);
    return `
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}" />
  <meta name="keywords" content="${meta.keywords}" />
  <meta property="og:title" content="${meta.title}" />
  <meta property="og:description" content="${meta.description}" />
  <meta property="og:image" content="${meta.ogImage}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${meta.title}" />
  <meta name="twitter:description" content="${meta.description}" />`.trim();
  }
};

module.exports = seoEngine;
