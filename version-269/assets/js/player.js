(function () {
  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.play-cover');
    var source = shell.getAttribute('data-video-src');

    if (!video || !source) {
      return;
    }

    function play() {
      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video.dataset.ready !== 'true') {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = source;
        }
        video.dataset.ready = 'true';
      }

      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.video-shell')).forEach(startPlayer);
})();
