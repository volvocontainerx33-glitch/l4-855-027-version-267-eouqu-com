(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = $('[data-menu-toggle]');
    var menu = $('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var carousel = $('[data-carousel]');
    if (!carousel) {
      return;
    }
    var slides = $all('.hero-slide', carousel);
    var dots = $all('.hero-dot', carousel);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalized(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var panels = $all('[data-filter-panel]');
    panels.forEach(function (panel) {
      var input = $('[data-search-input]', panel);
      var year = $('[data-year-filter]', panel);
      var type = $('[data-type-filter]', panel);
      var region = $('[data-region-filter]', panel);
      var targetSelector = panel.getAttribute('data-target') || '[data-filter-grid]';
      var grid = $(targetSelector);
      if (!grid) {
        return;
      }
      var cards = $all('.movie-card', grid);
      var empty = $('.empty-result');

      function apply() {
        var keyword = normalized(input && input.value);
        var selectedYear = normalized(year && year.value);
        var selectedType = normalized(type && type.value);
        var selectedRegion = normalized(region && region.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre')
          ].join(' ').toLowerCase();
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (selectedYear && normalized(card.getAttribute('data-year')) !== selectedYear) {
            matched = false;
          }
          if (selectedType && normalized(card.getAttribute('data-type')) !== selectedType) {
            matched = false;
          }
          if (selectedRegion && normalized(card.getAttribute('data-region')).indexOf(selectedRegion) === -1) {
            matched = false;
          }
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        document.body.classList.toggle('no-results', visible === 0);
        if (empty) {
          empty.style.display = visible === 0 ? 'block' : 'none';
        }
      }

      [input, year, type, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  var hlsLoaderPromise = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLoaderPromise) {
      return hlsLoaderPromise;
    }
    hlsLoaderPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsLoaderPromise;
  }

  function setupPlayers() {
    $all('.video-player').forEach(function (box) {
      var video = $('video', box);
      var overlay = $('.play-overlay', box);
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-video');
      var ready = false;

      function attach() {
        if (ready) {
          return Promise.resolve();
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          box.classList.add('player-ready');
          return Promise.resolve();
        }
        return loadHls().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            var hls = new Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            box.classList.add('player-ready');
          } else {
            video.src = source;
            box.classList.add('player-ready');
          }
        });
      }

      function play() {
        attach().then(function () {
          var attempt = video.play();
          if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {});
          }
        });
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }
      video.addEventListener('play', function () {
        box.classList.add('player-playing');
      });
      video.addEventListener('pause', function () {
        box.classList.remove('player-playing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
