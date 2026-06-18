(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        panel.classList.remove("is-open");
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setupCarousel() {
    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
      var prev = carousel.querySelector("[data-carousel-prev]");
      var next = carousel.querySelector("[data-carousel-next]");
      if (slides.length < 2) {
        return;
      }
      var index = 0;
      var timer;
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
          slide.setAttribute("aria-hidden", i === index ? "false" : "true");
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
          dot.setAttribute("aria-current", i === index ? "true" : "false");
        });
      }
      function start() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }
      carousel.addEventListener("mouseenter", function () {
        window.clearInterval(timer);
      });
      carousel.addEventListener("mouseleave", start);
      show(0);
      start();
    });
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
      var targetSelector = form.getAttribute("data-filter-target") || "";
      var scope = targetSelector ? document.querySelector(targetSelector) : document;
      var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".js-filter-card")) : [];
      var input = form.querySelector("[data-filter-input]");
      var category = form.querySelector("[data-filter-category]");
      var year = form.querySelector("[data-filter-year]");
      var type = form.querySelector("[data-filter-type]");
      var empty = document.querySelector(form.getAttribute("data-empty-target") || "");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");
      if (input && initialQuery && form.hasAttribute("data-read-query")) {
        input.value = initialQuery;
      }
      function apply() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var selectedCategory = category ? category.value : "";
        var selectedYear = year ? year.value : "";
        var selectedType = type ? type.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (selectedCategory && card.getAttribute("data-category") !== selectedCategory) {
            ok = false;
          }
          if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
            ok = false;
          }
          if (selectedType && card.getAttribute("data-type") !== selectedType) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      [input, category, year, type].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener(control.tagName === "INPUT" ? "input" : "change", apply);
      });
      apply();
    });
  }

  function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play-button]");
      var src = box.getAttribute("data-src");
      var loaded = false;
      if (!video || !src) {
        return;
      }
      function load() {
        if (loaded) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
        loaded = true;
      }
      function play() {
        load();
        box.classList.add("is-playing");
        var started = video.play();
        if (started && started.catch) {
          started.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
    });
  }

  ready(function () {
    setupMenu();
    setupCarousel();
    setupFilters();
    setupPlayers();
  });
})();
