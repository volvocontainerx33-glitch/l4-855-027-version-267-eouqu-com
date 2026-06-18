(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
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

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function textOf(card) {
    return [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-type") || "",
      card.getAttribute("data-year") || "",
      card.getAttribute("data-region") || "",
      card.getAttribute("data-genre") || "",
      card.getAttribute("data-tags") || ""
    ].join(" ").toLowerCase();
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-search]");
      var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));
      var sort = scope.querySelector("[data-sort]");
      var grid = scope.querySelector("[data-card-grid]");
      var empty = scope.querySelector("[data-empty-state]");

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function applySort(visibleCards) {
        if (!sort) {
          return;
        }

        var mode = sort.value;
        if (mode === "default") {
          cards.forEach(function (card) {
            grid.appendChild(card);
          });
          return;
        }

        visibleCards.slice().sort(function (a, b) {
          if (mode === "heat") {
            return Number(b.getAttribute("data-heat") || 0) - Number(a.getAttribute("data-heat") || 0);
          }
          if (mode === "year") {
            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
          }
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        }).forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function update() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var filters = selects.map(function (select) {
          return {
            key: select.getAttribute("data-filter"),
            value: select.value
          };
        });
        var visibleCards = [];

        cards.forEach(function (card) {
          var matched = true;
          if (query && textOf(card).indexOf(query) === -1) {
            matched = false;
          }
          filters.forEach(function (filter) {
            if (!filter.value) {
              return;
            }
            if ((card.getAttribute("data-" + filter.key) || "") !== filter.value) {
              matched = false;
            }
          });
          card.hidden = !matched;
          if (matched) {
            visibleCards.push(card);
          }
        });

        applySort(visibleCards);
        if (empty) {
          empty.hidden = visibleCards.length !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", update);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", update);
      });
      if (sort) {
        sort.addEventListener("change", update);
      }
    });
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (shell) {
      var video = shell.querySelector("video");
      var source = video ? video.querySelector("source") : null;
      var overlay = shell.querySelector(".player-overlay");
      var hls = null;

      if (!video || !source) {
        return;
      }

      function bindStream() {
        var stream = source.getAttribute("src");
        if (video.getAttribute("data-ready") === "true") {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.setAttribute("data-ready", "true");
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
          video.setAttribute("data-ready", "true");
          return;
        }

        video.src = stream;
        video.setAttribute("data-ready", "true");
      }

      function play() {
        bindStream();
        video.controls = true;
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
  });
})();
