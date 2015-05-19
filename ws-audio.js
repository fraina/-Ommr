// Web Audio API
(function(factory){
    var id = 'WSAudio';
    if (typeof define === 'function' && define.amd) {
        define(id, [], factory);
    } else {
        self[id] = factory();
    }
})(function(){
  'use strict';

  // TODO: this.o = {key: audio}
  var WSAudio = function() {
    this.o = null;
    this.sound = {};
    this.audio = {};
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
          attr = {
            'id': 'WSAudioWrapper'
          };

      if (typeof(params['loop']) != 'undefined' && params.loop) attr.loop = '';
      if (typeof(params['autoplay']) != 'undefined' && params.autoplay) {
        (Object.keys(sound).length === 1) ? attr.autoplay = '' : console.warn('Disable autoplay while there are multi sounds.');
      }

      this.sound = sound;
      this.multiplay = (typeof(params.multiplay) === 'boolean') ? params.multiplay : false;
      this.createAudioTag(attr);

      return this;
    },

    createAudioTag: function(attr) {
      var WSAudioWrapper = document.createElement('audio');
      this.setAttributes(WSAudioWrapper, attr);
      document.body.appendChild(WSAudioWrapper);
      this.o = WSAudioWrapper;

      return this;
    },

    createSourceTag: function(sound, appointType) {
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
        if (this.o.canPlayType(audioSupported[type]) && !Object.keys(attr).length) {
          attr = {
            'src': this.sound[sound] + '.' + type,
            'type': audioSupported[type],
            'id': 'soundSource'
          }
          this.setAttributes(source, attr);
        }
      }

      return this.o.appendChild(source);
    },

    play: function(sound, appointType) {
      var canPlay = (! this.o.canPlayType) ? false : true;

      if (! arguments.length) {
        this.o.play();
        return false;
      }

      if (canPlay) {
        if (! this.multiplay) {
          this.o.innerHTML = '';
          this.createSourceTag(sound, appointType);
          this.playing = sound;
          this.stop();
          this.o.play();
        }
      } else {
        console.warn('No audio support');
      }

      return this;
    },

    stop: function() {
      this.o.load();
      return this;
    },

    pause: function() {
      this.o.pause();
      return this;
    },

    toggleMuted: function() {
      this.o.muted = !this.o.muted;
      return this;
    },

    setVolume: function(value) {
      this.o.volume = value;
      return this;
    },

    status: function() {
      var res = {
        'playing': (this.o.currentTime) ? true : false,
        'currentTime': this.o.currentTime,
        'duration': this.o.duration,
        'muted': this.o.muted
      };
      return res;
    }

  }

  return WSAudio;

});
