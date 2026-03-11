async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const json = await response.json();
  if (!response.ok || !json.ok) {
    throw new Error(json.message || 'Request failed');
  }
  return json;
}

module.exports = fetchJson;
