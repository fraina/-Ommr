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
    this.setAttributes = function(el, attrs) {
      for(var key in attrs) {
        el.setAttribute(key, attrs[key]);
      }
    }
  }

  WSAudio.prototype = {
    init: function(params) {
      var sound = params.sounds || {},
          loopAll = params['loop'] || null,
          preloadAll = params['preload'] || null,
          defaultVolume = params['volume'] || 1,
          autoplay = false;

      if (params['autoplay'] === true) {
        (Object.keys(sound).length === 1) ? autoplay = true : console.warn('Disable autoplay while there are multi sounds.');
      }

      for (var key in sound) {
        var attr = {
            'class': 'WSAudioWrapper',
          };
        if (autoplay) attr.autoplay = '';
        if (loopAll != false && sound[key].loop != false) attr.loop = '';
        if (preloadAll != false && sound[key].preload != false) attr.preload = '';

        this.trackList[key] = {
          'path': sound[key],
          'audio': this.createAudioTag(sound[key], attr)
        }
      }

      this.multiplay = (typeof(params.multiplay) === 'boolean') ? params.multiplay : false;
      if (defaultVolume != 1) this.setVolume(defaultVolume);

      return this;
    },

    createAudioTag: function(sound, attr, defaultVolume) {
      var WSAudioWrapper = document.createElement('audio');
      this.setAttributes(WSAudioWrapper, attr);
      if (WSAudioWrapper.canPlayType) {
        this.createSourceTag(WSAudioWrapper, sound);
      } else {
        throw new Error('No audio support');
      }

      return WSAudioWrapper;
    },

    createSourceTag: function(audio, sound, appointType) {
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
            'src': sound.path + '.' + type,
            'type': audioSupported[type]
          }
          this.setAttributes(source, attr);
        }
      }

      return audio.appendChild(source);
    },

    play: function(sound, appointType) {
      if (!arguments.length || sound === this.playing) {
        if (this.o != null) this.o.play();
      } else if (this.checkSoundValid(sound)) {
        if (! this.multiplay) {
          if (this.o != null) this.stop();
        }
        // reflesh pointer
        this.o = this.trackList[sound].audio;
        this.trackList[sound].audio.play();
        this.playing = sound;
      }

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

    toggleMuted: function(sound) {
      if (this.status() != null) {
        if (sound && this.checkSoundValid(sound)) {
          var mutedStatus = this.trackList[sound].audio.muted;
          mutedStatus = !mutedStatus;
        } else {
          this.o.muted = !this.o.muted;
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
      var res = null;
      if (this.o != null) {
        res = {
          'isPlaying': (this.o.currentTime) ? true : false,
          'sound': this.playing,
          'currentTime': this.o.currentTime,
          'duration': this.o.duration,
          'volume': this.o.volume,
          'muted': this.o.muted
        };
      }

      return res;
    },

    checkSoundValid: function(sound) {
      var res = false;
      for (var key in this.trackList) {
        if (key === sound) {
          res = true;
        }
      }
      if (!res) throw new Error('appointed track "' + sound + '" is invalid')

      return res;
    }

  }

  return WSAudio;

});
