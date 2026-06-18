(function () {
  function initMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var button = document.getElementById(config.buttonId);
    var source = config.source;
    var attached = false;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function startPlayback(event) {
      if (event) {
        event.preventDefault();
      }
      attachSource();
      hideOverlay();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }
    if (overlay) {
      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
          startPlayback(event);
        }
      });
    }
    video.addEventListener("play", hideOverlay);
    video.addEventListener("loadedmetadata", hideOverlay);
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
