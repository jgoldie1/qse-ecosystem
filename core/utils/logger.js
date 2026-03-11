module.exports = {
  info(message, meta = {}) {
    console.log("[INFO]", message, meta);
  },
  error(message, meta = {}) {
    console.error("[ERROR]", message, meta);
  }
};
