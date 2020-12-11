import axios from 'axios';

import load from './load';

async function fetch(url, type) {
  const res = await axios(url, { responseType: type || 'json' });
  if (res.status >= 300) throw Error(`Status code: ${res.statusCode}`);
  return res.data;
}

/**
 * Load audio
 * @param {string} path
 * @param {object} options
 * @param {AudioContext} options.context
 * @return {Promise<ArrayBuffer[]>}
 */
export default function loadAudio(path, options) {
  if (!options.context) throw Error('Missing "context" option');
  return load(path, { fetch, ...options });
}
