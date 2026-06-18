(function () {
  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var links = document.querySelector('[data-nav-links]');

    if (!toggle || !links) {
      return;
    }

    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    if (!slides.length) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupSearchFilter() {
    var input = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var count = document.querySelector('[data-result-count]');
    var list = document.querySelector('[data-card-list]');
    var noResult = null;

    if (!input || !cards.length) {
      return;
    }

    function ensureNoResult() {
      if (!noResult && list) {
        noResult = document.createElement('div');
        noResult.className = 'no-results';
        noResult.textContent = '没有找到匹配影片，请尝试更换关键词。';
        noResult.style.display = 'none';
        list.appendChild(noResult);
      }
    }

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function filterCards() {
      var keyword = normalize(input.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.textContent
        ].join(' '));
        var matched = !keyword || text.indexOf(keyword) !== -1;

        card.classList.toggle('is-filtered-out', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部影片';
      }

      ensureNoResult();
      if (noResult) {
        noResult.style.display = visible ? 'none' : 'block';
      }
    }

    input.addEventListener('input', filterCards);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var message = player.querySelector('[data-player-message]');
      var source = player.getAttribute('data-video-src');
      var started = false;

      if (!video || !button || !source) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function playVideo() {
        if (started) {
          video.play();
          return;
        }

        started = true;
        setMessage('正在初始化播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play();
          }, { once: true });
          button.classList.add('is-hidden');
          setMessage('');
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            button.classList.add('is-hidden');
            setMessage('');
            video.play();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('播放源加载失败，请稍后重试。');
            }
          });
          return;
        }

        video.src = source;
        button.classList.add('is-hidden');
        setMessage('当前浏览器可能不支持 m3u8 播放，请使用支持 HLS 的浏览器。');
        video.play().catch(function () {});
      }

      button.addEventListener('click', playVideo);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHeroSlider();
    setupSearchFilter();
    setupPlayers();
  });
})();
