# Audio Loader

It used to be a patched fork of
[`audio-loader`](https://www.npmjs.com/package/audio-loader) library,
but starting from `v1.2.0` it has been refactored to drop NodeJS support,
and thanks to that to use the minimum of dependencies (many of which were
not actively maintained).

There are also some changes in the API.

**ORIGINAL README BELOW, IT IS PENDING AN UPDATE**

An simple and flexible audio buffer loader for browser.

```js
var load = require('@dr.pogodin/audio-loader')

// load one file
load('http://example.net/audio/file.mp3').then(function (buffer) {
  console.log(buffer) // => <AudioBuffer>
})

// load a collection of files
load({ snare: 'samples/snare.wav', kick: 'samples/kick.wav' },
  { from: 'http://example.net/'} ).then(function (audio) {
  console.log(audio) // => { snare: <AudioBuffer>, kick: <AudioBuffer> }
})
```

## Features

- Load single audio files or collection of them (either using arrays or data objects)
- Load base64 encoded audio strings
- Compatible with midi.js pre-rendered soundfonts packages like [midi-js-soundfonts](https://github.com/gleitz/midi-js-soundfonts/tree/master/MusyngKite)
- Compatible with json encoded audio like [sampled](https://github.com/danigb/sampled)


## Install

__Npm__

`npm i --save audio-loader`

__Yarn__

`yarn add audio-loader`

__Browser__

Download the [minified distribution](https://raw.githubusercontent.com/danigb/audio-loader/master/dist/audio-loader.min.js) which exports `loadAudio` as window global:

```html
<script src="audio-loader.min.js"></script>
<script>
  loadAudio({ snare: 'snare.wav' }, { from: 'oramics.github.io/sampled/' }).then(..)
</script>
```

## Usage

<a name="load"></a>

#### Load audio files

You can load individual or collection of files:

```js
load('http://path/to/file.mp3').then(function (buffer) {
  // buffer is an AudioBuffer
  play(buffer)
})

// apply a prefix using options.from
load(['snare.mp3', 'kick.mp3'], { from: 'http://server.com/audio/' }).then(function (buffers) {
  // buffers is an array of AudioBuffers
  play(buffers[0])
})

// the options.from can be a function
function toUrl (name) { return 'http://server.com/samples' + name + '?key=secret' }
load({ snare: 'snare.mp3', kick: 'kick.mp3' }, { from: toUrl }).then(function (buffers) {
  // buffers is a hash of names to AudioBuffers
  play(buffers['snare'])
})
```

#### Recursive loading

`audio-loader` will detect if some of the values of an object is an audio file name and try to fetch it:

```js
var inst = { name: 'piano', gain: 0.2, audio: 'samples/piano.mp3' }
load(inst).then(function (piano) {
  console.log(piano.name) // => 'piano' (it's not an audio file)
  console.log(piano.gain) // => 0.2 (it's not an audio file)
  console.log(piano.audio) // => <AudioBuffer> (it loaded the file)
})
```

#### Load soundfont files

If you provide a `.js` file, `audio-loader` will interpret it as a [midi.js](https://github.com/mudcube/MIDI.js) soundfont file and try to load it:

```js
load('acoustic_grand_piano-ogg.js').then(function (buffers) {
  buffers['C2'] // => <AudioBuffer>
})
```

This is a repository of them: https://github.com/gleitz/midi-js-soundfonts

#### API
### `load(source, options)`

| Param | Type | Description |
| --- | --- | --- |
| source | <code>Object</code> | the object to be loaded: can be an URL string, ArrayBuffer with encoded data or an array/map of sources |
| options | <code>Object</code> | (Optional) the load options for that source |

Possible `options` keys are:

- `from?: function|string` &ndash; Optional. A function or string to convert
  from file names to urls.
  If is a string it will be prefixed to the name:
  `load('snare.mp3', { from: 'http://audio.net/samples/' })`
  If it's a function it receives the file name and should return the url as
  string.
- `only?: {Array} - Optional. When loading objects, if provided, only the given
  keys will be included in the decoded object:
  `load('piano.json', { only: ['C2', 'D2'] })`
- __decode__ {Function}: a function to decode audio. It receives a buffer and must return a promise to an audio buffer.
- __fetch__ {Function}: a function to fetch files. It receives an url and a response type (one of 'arraybuffer' or 'text') and must return a promise to the contents

## Run tests and examples

To run the test, clone this repo and:

```bash
npm install
npm test
```

To run the browser example:

```bash
npm i -g budo
npm run browser-example
```

## License

MIT License
