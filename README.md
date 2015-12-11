♪ommr
=========

[![npm](https://img.shields.io/npm/l/express.svg?style=flat)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/ommr.svg?style=flat)](https://www.npmjs.com/package/ommr)

Play sound from JavaScript with HTML5 audio tag backend.


## Initialization ##
Import plugin: ommr.js.
```
var audio = new Ommr();
audio.init({
  'sounds': {
    'track_alias': {
      'file': 'track_fileName',
      'type': 'ogg'
    },
    'soundA': {
      'file': 'A_fileName',
      'volume': 1,
      'preload': false
    },
    'soundB': {
      'file': 'B_fileName',
      'loop': false
    }
  },
  'path': 'path/',
  'volume': 0.7,
  'autoplay': true,
  'preload': true,
  'callbacks': {
    // play, stop ...
  }
});
```

## Usage ##

### Settings ###

 - path (General)
 - autoplay (General)
 - callbacks (General):
   * play
   * ended
   * pause
   * timeupdate
   * durationchange
   * volumechange
 - loop (Sound object)
 - preload (General, Sound object)
 - volume (General, Sound object)
 - type (General, Sound object)

### API ###

 - play
```
audio.play('soundA');
audio.play('soundA', 'ogg');
audio.play();   // the last played track
```
 - pause
```
audio.pause('soundA');
audio.pause();   // the last played track
```
 - pauseAll
 - stop
```
audio.stop('soundA');
audio.stop();   // the last played track
```
 - stopAll
 - changeProgress('newCurrentTime')
 - toggleMuted
 - setSoundVolume
```
audio.setSoundVolume('soundA', 0.5);
audio.setSoundVolume(0.5);   // change the last played track's volume to 0.5
```
 - setVolume

   This method will influence all tracks, including those tracks were changed by `setSoundVolume`.
 - status
 - getTrackList

## License ##
MIT