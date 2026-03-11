/**
 * QSE Ecosystem - Shared UI Components
 * CommonJS / browser-compatible (UMD) UI helpers used across all platforms.
 * Uses HTML-string rendering so the same helpers work in both browser and
 * server-side (SSR / templating) contexts.
 *
 * Depends on shared/utils (QSEUtils in browser, require('../utils') in Node).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../utils'));
  } else {
    root.QSEComponents = factory(root.QSEUtils);
  }
}(typeof self !== 'undefined' ? self : this, function (utils) {
  'use strict';

  var escapeHTML = utils.escapeHTML;

  /**
   * Render a course card as an HTML string.
   * The enroll button carries a `data-course-id` attribute so the caller can
   * attach a single delegated event listener rather than using inline handlers.
   *
   * @param {{ id: string, title: string, duration: string }} course
   * @param {string} [icon='🎓']
   * @returns {string} HTML markup
   */
  function renderCourseCard(course, icon) {
    var safeIcon = escapeHTML(icon || '🎓');
    var safeId = escapeHTML(course.id);
    var safeTitle = escapeHTML(course.title);
    var safeDuration = escapeHTML(course.duration);
    return (
      '<div class="card">' +
        '<div class="card-icon">' + safeIcon + '</div>' +
        '<h3>' + safeTitle + '</h3>' +
        '<p>Duration: ' + safeDuration + '</p>' +
        '<button class="btn btn-outline" data-course-id="' + safeId + '">Enroll Free</button>' +
      '</div>'
    );
  }

  /**
   * Render an empty-state paragraph for a courses grid.
   *
   * @param {string} [text='No courses available yet.']
   * @returns {string} HTML markup
   */
  function renderEmptyCourses(text) {
    return '<p class="loading">' + escapeHTML(text || 'No courses available yet.') + '</p>';
  }

  /**
   * Append a chat message to a DOM container.
   * Safe to call only in a browser environment where `document` is available.
   *
   * @param {string} containerId - ID of the chat messages element
   * @param {'user'|'coach'} type  - Message author
   * @param {string} text          - Plain-text message content
   */
  function appendMessage(containerId, type, text) {
    if (typeof document === 'undefined') return;
    var container = document.getElementById(containerId);
    if (!container) return;
    var div = document.createElement('div');
    div.className = 'chat-msg ' + type;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  return { renderCourseCard, renderEmptyCourses, appendMessage };
}));
