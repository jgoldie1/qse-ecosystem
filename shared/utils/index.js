/**
 * QSE Ecosystem - Shared Utilities
 * CommonJS / browser-compatible (UMD) data helpers used across all platforms.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.QSEUtils = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Fetch a URL and parse the JSON response.
   * Rejects if the HTTP response status is not ok.
   *
   * @param {string} url
   * @param {RequestInit} [options]
   * @returns {Promise<any>}
   */
  function fetchJSON(url, options) {
    return fetch(url, options).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }

  /**
   * Generate a short random guest user ID.
   *
   * @returns {string}
   */
  function generateGuestId() {
    return 'guest-' + Math.random().toString(36).slice(2, 8);
  }

  /**
   * Filter a courses array to those matching an app name or marked as 'general'.
   *
   * @param {Array<{app: string}>} courses
   * @param {string} appName
   * @returns {Array}
   */
  function filterCoursesByApp(courses, appName) {
    return courses.filter(function (c) {
      return c.app === appName || c.app === 'general';
    });
  }

  /**
   * Escape a string for safe insertion into HTML.
   *
   * @param {string} str
   * @returns {string}
   */
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  return { fetchJSON, generateGuestId, filterCoursesByApp, escapeHTML };
}));
