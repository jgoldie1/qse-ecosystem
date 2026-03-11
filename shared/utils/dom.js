function mount(selector, html) {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = html;
}

function byId(id) {
  return document.getElementById(id);
}

module.exports = {
  mount,
  byId
};
