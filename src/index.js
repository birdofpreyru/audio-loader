import axios from 'axios';
import decode from 'audio-decode';
import isUrl from 'is-url';

import load from './load';
import { IS_CLIENT_SIDE, requireWeak } from './utils';

let fs;
if (!IS_CLIENT_SIDE) {
  fs = requireWeak('fs');
  requireWeak('aac');
}

/**
 * Server-side only!.
 * @param {string} url
 */
function readFile(url) {
  return new Promise((resolve, reject) => {
    fs.readFile(url, (error, data) => {
      if (error) reject(error);
      else resolve(data.buffer);
    });
  });
}

async function sendRequest(url, type) {
  const res = await axios(url, { responseType: type || 'json' });
  if (!res.statusCode >= 300) throw Error(`Status code: ${res.statusCode}`);
  return res.data;
}

function fetch(url, type) {
  return IS_CLIENT_SIDE || isUrl(url) ? sendRequest(url, type) : readFile(url);
}

/**
 * Load audio
 */
module.exports = function loadAudio(
  path,
  optionsOrCallback,
  callbackOrUndefined,
) {
  const opts = { decode, fetch };
  let callback = callbackOrUndefined;
  if (optionsOrCallback instanceof Function) callback = optionsOrCallback;
  else Object.assign(opts, optionsOrCallback);
  if (!opts.ready) opts.ready = callback || (() => undefined);
  return load(path, opts);
};
