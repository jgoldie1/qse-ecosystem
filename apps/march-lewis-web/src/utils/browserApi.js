/* March & Lewis - Browser API Utilities */

(function (global) {
  var BrowserApi = {
    getParam: function (name) {
      var params = new URLSearchParams(global.location.search);
      return params.get(name);
    },

    getHash: function () {
      return global.location.hash.slice(1);
    },

    navigate: function (url) {
      global.location.href = url;
    },

    onReady: function (fn) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
      } else {
        fn();
      }
    },

    storage: {
      get: function (key) {
        try { return JSON.parse(localStorage.getItem(key)); } catch (e) { console.warn('BrowserApi.storage.get failed:', e); return null; }
      },
      set: function (key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.warn('BrowserApi.storage.set failed:', e); }
      },
      remove: function (key) {
        try { localStorage.removeItem(key); } catch (e) { console.warn('BrowserApi.storage.remove failed:', e); }
      }
    }
  };

  global.BrowserApi = BrowserApi;
})(window);
