import assert from 'assert';
import isBuffer from 'is-audio-buffer';
import wavBuffer from 'audio-lena/wav';
import mp3Buffer from 'audio-lena/mp3';
import rawBuffer from 'audio-lena/raw';
import it from 'tape';
import path from 'path';
import load from '../src';

function testBuffer(buffer) {
  assert(buffer, 'buffer is present');
  assert(isBuffer(buffer), 'buffer is a buffer');
  return buffer;
}

it('load wav buffer', (t) => {
  load(wavBuffer).then(testBuffer).then(() => t.end(), () => t.fail());
});
it('load mp3 buffer', (t) => {
  load(mp3Buffer).then(testBuffer).then(() => t.end(), () => t.fail());
});
it('load wav files', (t) => {
  load(`${__dirname}/data/maeclave.wav`)
    .then(testBuffer)
    .then(() => t.end(), () => t.fail());
});
it('should throw error on undecodable data', (t) => {
  load(rawBuffer).then(() => {
    t.fail();
  }, (e) => {
    t.ok(e);
    t.end();
  });
});
it('load mp3 files', (t) => {
  load(`${__dirname}/data/train.mp3`)
    .then(testBuffer)
    .then(() => t.end(), () => t.fail());
});
it('load m4a files', (t) => {
  load(`${__dirname}/data/bassnote.m4a`)
    .then(testBuffer)
    .then(() => t.end(), () => t.fail());
});
it('load absolute paths', (t) => {
  load(path.resolve(`${__dirname}/data/train.mp3`))
    .then(testBuffer)
    .then(() => t.end(), () => t.fail());
});
it('load remote files', (t) => {
  load('https://ia802508.us.archive.org/5/items/testmp3testfile/mpthreetest.mp3')
    .then(testBuffer).then(() => t.end(), (e) => t.fail(e));
});
