/**
 * High-level testing of the library.
 */

import fs from 'fs';
import mockAxios from 'jest-mock-axios';
import audioLoader from '../src';

const PIANO_JS_URL = '__assets__/piano.js';

const MockAudioContext = {
  decodeAudioData: jest.fn((array, onSuccess, onError) => {
    if (array instanceof ArrayBuffer) onSuccess(array.slice(0));
    else onError(Error('Invalid array'));
  }),
};

afterEach(() => {
  mockAxios.reset();
  MockAudioContext.decodeAudioData.mockClear();
});

it('loads MIDI.js soundfont', async () => {
  let soundfont = audioLoader(PIANO_JS_URL, { context: MockAudioContext });
  mockAxios.mockResponseFor({ responseType: 'text', url: PIANO_JS_URL }, {
    data: fs.readFileSync(`${__dirname}/${PIANO_JS_URL}`, 'utf8'),
    status: 200,
  });
  soundfont = await soundfont;
  expect(MockAudioContext.decodeAudioData).toHaveBeenCalled();
  expect(soundfont).toMatchSnapshot();
  Object.keys(soundfont).forEach((key) => {
    soundfont[key] = new Uint8Array(soundfont[key]);
  });
  expect(soundfont).toMatchSnapshot();
});

it('refuses to work without AudioContext provided', () => {
  expect(() => audioLoader(PIANO_JS_URL))
    .toThrowErrorMatchingSnapshot();
  expect(() => audioLoader(PIANO_JS_URL, {}))
    .toThrowErrorMatchingSnapshot();
});

it('throws error on network issues', async () => {
  const soundfont = audioLoader(PIANO_JS_URL, { context: MockAudioContext });
  mockAxios.mockError(Error('Test network error'));
  await expect(soundfont).rejects.toThrowErrorMatchingSnapshot();
});
