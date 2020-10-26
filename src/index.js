import fs from 'fs';

import axios from 'axios';
import isAbsolute from 'is-absolute';
import isRelative from 'is-relative';
import isURL from 'is-url';

import decode from 'audio-decode';
import 'aac'; // Note: this import MUST BE after the "audio-decode" one.

import load from './load';

function isPath(url) {
  return isAbsolute(url) || (isRelative(url) && !isURL(url));
}

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
  return isPath(url) ? readFile(url) : sendRequest(url, type);
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
