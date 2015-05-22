// WebSounder - Audio
(function(factory){
    var id = 'WSAudio';
    if (typeof define === 'function' && define.amd) {
        define(id, [], factory);
    } else {
        self[id] = factory();
    }
})(function(){
  'use strict';

  var WSAudio = function() {
    // pointer
    this.o = null;
    this.trackList = {};
    this.playing = '';
    this.multiplay = false;
    this.callbacks = {};
  }

  WSAudio.prototype = {
    init: function(params) {
      var soundData = params.sounds || {},
          loopAll = params['loop'] || false,
          preloadAll = params['preload'] || false,
          defaultVolume = params['volume'] || 1,
          audioType = params['type'] || null,
          path = params['path'] || '',
          autoplay = false;

      if (params['autoplay'] === true) {
        (Object.keys(soundData).length === 1) ? autoplay = true : console.warn('Disable autoplay while there are multi sounds.');
      }
      if (params['callbacks']) this.callbacks = params['callbacks'];

      this.formatPath = this.formatPath(path);
      this.multiplay = (typeof(params.multiplay) === 'boolean') ? params.multiplay : false;

      for (var key in soundData) {
        var attr = {};
        if (autoplay) attr.autoplay = '';
        if (loopAll != false && soundData[key].loop != false) attr.loop = '';
        if (preloadAll != false && soundData[key].preload != false) attr.preload = '';
        if (soundData[key].volume >= 0 && soundData[key].volume <= 1) attr.volume = soundData[key].volume;
        if (audioType != null || soundData[key].type) attr.type = soundData[key].type || audioType;

        this.trackList[key] = {
          'info': soundData[key],
          'audio': this.createAudioTag(soundData[key], attr)
        }
      }
      this.applyDefaultVolume(defaultVolume);

      return this;
    },

    play: function(sound, appointType) {
      if (!arguments.length || (arguments.length === 1 && sound === this.playing)) {
        if (this.o != null) this.o.play();
      } else if (this.checkSoundValid(sound)) {
        if (! this.multiplay) {
          if (this.o != null) this.stop();
        }
        // reflesh pointer
        this.o = this.trackList[sound].audio;
        this.playing = sound;
        switch (arguments.length) {
          case 1:
            this.o.play();
            break;
          case 2:
            this.stop();
            this.o.innerHTML = '';
            this.createSourceTag(this.o, this.trackList[sound].info, arguments[1]);
            this.o.load();
            this.o.play();
            break;
          default:
            return false;
        }
      }

      this.bindEventListener();

      return this;
    },

    stop: function(sound) {
      if (this.status() != null) {
        (sound && this.checkSoundValid(sound)) ? this.trackList[sound].audio.load() : this.o.load();
      }

      return this;
    },

    stopAll: function() {
      for (var key in this.trackList) {
        this.stop(key);
      }

      return this;
    },

    pause: function(sound) {
      if (this.status() != null) {
        (sound && this.checkSoundValid(sound)) ? this.trackList[sound].audio.pause() : this.o.pause();
      }

      return this;
    },

    pauseAll: function() {
      for (var key in this.trackList) {
        this.pause(key);
      }

      return this;
    },

    toggleMuted: function() {
      if (this.status() != null) {
        var mutedStatus = this.o.muted;
        for (var key in this.trackList) {
          this.trackList[key].audio.muted = !mutedStatus
        }
      }

      return this;
    },

    setSoundVolume: function(sound, value) {
      if (arguments.length === 2 && this.checkSoundValid(sound)) {
        this.trackList[sound].audio.volume = arguments[1];
      } else {
        if (this.o != null) this.o.volume = arguments[0];
      }

      return this;
    },

    setVolume: function(value) {
      for (var key in this.trackList) {
        this.setSoundVolume(key, value);
      }

      return this;
    },

    status: function() {
      var res = null,
          self = this;
      if (this.o != null) {
        res = {
          'status': (function() {
            var isPlaying = (self.o.currentTime) ? true : false,
                isPaused = self.o.paused,
                ret = '';
            if (isPlaying && isPaused) { ret = 'pause'; }
            else if ((!isPlaying && isPaused) || (!isPlaying && !isPaused)) { ret = 'stop'; }
            else if (isPlaying && !isPaused) { ret = 'playing'; }

            return ret;
          })(),
          'sound': this.playing,
          'currentTime': this.o.currentTime,
          'duration': this.o.duration,
          'volume': this.o.volume,
          'muted': this.o.muted
        };
      }

      return res;
    },

    getTrackList: function() {
      var res = {},
          keys = Object.keys(this.trackList),
          i = 0;

      for (i; i < keys.length; i++) {
        res[i] = {
          'name': keys[i],
          'duration': this.trackList[keys[i]].audio.duration,
          'playing': (this.trackList[keys[i]].audio.currentTime) ? true : ''
        }
      }

      return res;
    },

    // helpers

    checkSoundValid: function(sound) {
      var res = false;
      for (var key in this.trackList) {
        if (key === sound) {
          res = true;
        }
      }
      if (!res) throw new Error('appointed track "' + sound + '" is invalid')

      return res;
    },

    createAudioTag: function(soundData, attr) {
      var WSAudioWrapper = document.createElement('audio'),
          appointType = attr.type || null;
      this.setAttributes(WSAudioWrapper, attr);
      if (WSAudioWrapper.canPlayType) {
        this.createSourceTag(WSAudioWrapper, soundData, appointType);
      } else {
        throw new Error('No audio support');
      }
      return WSAudioWrapper;
    },

    createSourceTag: function(audio, soundData, appointType) {
      var source = document.createElement('source'),
          attr = new Object(),
          audioSupported = {
            'mp3': 'audio/mpeg',
            'ogg': 'audio/ogg;codecs="vorbis"',
            'm4a': 'audio/mp4;codecs="mp4a.40.5"',
            'wav': 'audio/wav'
          };

      for (var key in audioSupported) {
        var type = appointType || key;
        if (audio.canPlayType(audioSupported[type]) && !Object.keys(attr).length) {
          attr = {
            'src': this.formatPath(soundData.file) + '.' + type,
            'type': audioSupported[type]
          }
          this.setAttributes(source, attr);
        }
      }

      return audio.appendChild(source);
    },

    setAttributes: function(el, attrs) {
      for(var key in attrs) {
        el.setAttribute(key, attrs[key]);
      }
    },

    formatPath: function(path) {
      return function(fileName) {
        return path + fileName;
      }
    },

    applyDefaultVolume: function(defaultVolume) {
      for (var key in this.trackList) {
        var volume = this.trackList[key].audio.getAttribute('volume');
        this.setSoundVolume(key, (volume) ? volume : defaultVolume);
      }

      return this;
    },

    bindEventListener: function() {
      var self = this;
      function ael(key) {
        self.o.addEventListener(key, function() { self.callbacks[key](); })
      }
      for (var key in this.callbacks) ael(key);

      return this;
    }

  }

  return WSAudio;

});
