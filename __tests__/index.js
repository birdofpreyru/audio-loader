/**
 * High-level testing of the library.
 */

import fs from 'fs';
import mockAxios from 'jest-mock-axios';
import audioLoader from '../src';

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
  const URL = '__assets__/piano.js';
  let soundfont = audioLoader(URL, { context: MockAudioContext });
  mockAxios.mockResponseFor({ responseType: 'text', url: URL }, {
    data: fs.readFileSync(`${__dirname}/${URL}`, 'utf8'),
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
  expect(() => audioLoader('__assets__/piano.js'))
    .toThrowErrorMatchingSnapshot();
  expect(() => audioLoader('__assets__/piano.js', {}))
    .toThrowErrorMatchingSnapshot();
});
