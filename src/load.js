/* global atob */

// Given a regex, return a function that test if against a string
function fromRegex(r) {
  return (o) => typeof o === 'string' && r.test(o);
}

// Try to apply a prefix to a name
function prefix(pre, name) {
  switch (typeof pre) {
    case 'string': return pre + name;
    case 'function': return pre(name);
    default: return name;
  }
}

let selectLoader;

/**
 * Load one or more audio files
 *
 *
 * Possible option keys:
 *
 * - __from__ {Function|String}: a function or string to convert from file names to urls.
 * If is a string it will be prefixed to the name:
 * `load('snare.mp3', { from: 'http://audio.net/samples/' })`
 * If it's a function it receives the file name and should return the url as string.
 * - __only__ {Array} - when loading objects, if provided, only the given keys
 * will be included in the decoded object:
 * `load('piano.json', { only: ['C2', 'D2'] })`
 *
 * @param {Object} source - the object to be loaded
 * @param {Object} options - (Optional) the load options for that object
 * @param {Object} defaultValue - (Optional) the default value to return as
 * in a promise if not valid loader found
 * @return {Promise<object>}
 */
export default async function load(source, options = {}, defVal) {
  const loader = selectLoader(source);
  if (loader) return loader(source, options);
  if (defVal) return defVal;
  throw Error(`Source not valid (${source})`);
}

// BASIC AUDIO LOADING
// ===================

/**
 * Loads (decodes) an array buffer holding an audio sample.
 * @param {ArrayBuffer} array Input buffer with encoded sample.
 * @param {AudioContext} context AudioContext instance to use for decoding.
 * @return {ArrayBuffer} Resulting buffer with decoded sample.
 */
function decodeBuffer(array, { context }) {
  return new Promise((resolve, reject) => {
    context.decodeAudioData(array, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

// Load an audio filename
const isAudioFileName = fromRegex(/\.(mp3|wav|ogg|m4a)(\?.*)?$/i);
function loadAudioFile(name, options) {
  const url = prefix(options.from, name);
  return load(options.fetch(url, 'arraybuffer'), options);
}

// Load the result of a promise
function isPromise(o) { return o && typeof o.then === 'function'; }
function loadPromise(promise, options) {
  return promise.then((value) => load(value, options));
}

// COMPOUND OBJECTS
// ================

// Try to load all the items of an array
const { isArray } = Array;
function loadArrayData(array, options) {
  return Promise.all(array.map((data) => load(data, options, data)));
}

// Try to load all the values of a key/value object
function isObject(o) { return o && typeof o === 'object'; }
function loadObjectData(obj, options) {
  const dest = {};
  const promises = Object.keys(obj).map((key) => {
    if (options.only && options.only.indexOf(key) === -1) return null;
    const value = obj[key];
    return load(value, options, value).then((audio) => {
      dest[key] = audio;
    });
  });
  return Promise.all(promises).then(() => dest);
}

// Load the content of a JSON file
const isJsonFileName = fromRegex(/\.json(\?.*)?$/i);
function loadJsonFile(name, options) {
  const url = prefix(options.from, name);
  return load(options.fetch(url, 'text').then(JSON.parse), options);
}

// BASE64 ENCODED FORMATS
// ======================

// Load strings with Base64 encoded audio
const isBase64Audio = fromRegex(/^data:audio/);
function loadBase64Audio(source, options) {
  // The Base64-encoded payload in source is expected to be prefixed by
  // "data:audio/mp3;base64," or something similar.
  const start = source.indexOf(',');
  const data = atob(source.slice(1 + start));
  const buffer = new ArrayBuffer(data.length);
  const uint8 = new Uint8Array(buffer);
  for (let i = 0; i < data.length; ++i) uint8[i] = data.charCodeAt(i);
  return load(buffer, options);
}

/**
 * Converts MIDI.js data from string to JS object.
 * @param {string} data
 * @return {Object}
 */
function midiJsToJson(data) {
  let begin = data.indexOf('MIDI.Soundfont.');
  if (begin < 0) throw Error('Invalid MIDI.js Soundfont format');
  begin = 1 + data.indexOf('=', begin);
  const end = 1 + data.lastIndexOf('}');
  /* eslint-disable no-new-func */
  return Function(`return (${data.slice(begin, end)})`)();
  /* eslint-enable no-new-func */
}

// Load .js files with MidiJS soundfont prerendered audio
const isJsFileName = fromRegex(/\.js(\?.*)?$/i);
function loadMidiJSFile(name, options) {
  const url = prefix(options.from, name);
  return load(options.fetch(url, 'text').then(midiJsToJson), options);
}

/**
 * Returns the correct loader for deduced source type.
 * @param {any} source
 * @return {function}
 */
selectLoader = (source) => {
  // Basic audio loading
  if (source instanceof ArrayBuffer) return decodeBuffer;
  if (isAudioFileName(source)) return loadAudioFile;
  if (isPromise(source)) return loadPromise;

  // Compound objects
  if (isArray(source)) return loadArrayData;
  if (isObject(source)) return loadObjectData;
  if (isJsonFileName(source)) return loadJsonFile;

  // Base64 encoded audio
  if (isBase64Audio(source)) return loadBase64Audio;
  if (isJsFileName(source)) return loadMidiJSFile;
  return undefined;
};
