module.exports = {
  send(type, payload) {
    return {
      success: true,
      type,
      payload,
      message: "Notification simulated successfully."
    };
  }
};
