(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      siteNav.classList.toggle("open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5800);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.heroDot || 0));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getIndex() {
    return Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
  }

  function createResultCard(item) {
    const tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHTML(tag) + "</span>";
    }).join("");

    return "<article class=\"movie-card\">" +
      "<a class=\"poster-frame\" href=\"" + escapeHTML(item.url) + "\">" +
      "<img src=\"" + escapeHTML(item.cover) + "\" alt=\"" + escapeHTML(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-badge\">" + escapeHTML(item.category) + "</span>" +
      "<span class=\"heat-badge\">" + escapeHTML(item.year) + "</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<p class=\"meta-line\">" + escapeHTML([item.year, item.region, item.type].filter(Boolean).join(" · ")) + "</p>" +
      "<h3><a href=\"" + escapeHTML(item.url) + "\">" + escapeHTML(item.title) + "</a></h3>" +
      "<p>" + escapeHTML(item.oneLine || "") + "</p>" +
      "<div class=\"tag-list\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function searchMovies(query, limit) {
    const text = String(query || "").trim().toLowerCase();
    const list = getIndex();
    if (!text) return list.slice(0, limit || 24);
    const terms = text.split(/\s+/).filter(Boolean);
    return list.filter(function (item) {
      const haystack = String(item.search || "").toLowerCase();
      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    }).slice(0, limit || 48);
  }

  const instantInput = document.querySelector("[data-search-input]");
  const instantResults = document.querySelector("[data-instant-results]");

  if (instantInput && instantResults) {
    instantInput.addEventListener("input", function () {
      const q = instantInput.value;
      const limit = Number(instantInput.dataset.searchLimit || 8);
      const results = searchMovies(q, limit);
      if (!q.trim()) {
        instantResults.innerHTML = "";
        return;
      }
      instantResults.innerHTML = results.map(function (item) {
        return "<a href=\"" + escapeHTML(item.url) + "\"><span>" + escapeHTML(item.title) + "</span><small>" + escapeHTML([item.year, item.region, item.type].filter(Boolean).join(" · ")) + "</small></a>";
      }).join("") || "<div class=\"empty-state\">暂无匹配内容</div>";
    });
  }

  const searchInput = document.querySelector("[data-search-page-input]");
  const searchButton = document.querySelector("[data-search-page-button]");
  const searchResults = document.querySelector("[data-search-results]");

  if (searchInput && searchResults) {
    const params = new URLSearchParams(window.location.search);
    searchInput.value = params.get("q") || "";

    function render() {
      const results = searchMovies(searchInput.value, 96);
      searchResults.innerHTML = results.length ? results.map(createResultCard).join("") : "<div class=\"empty-state\">暂无匹配内容</div>";
    }

    searchInput.addEventListener("input", render);
    if (searchButton) {
      searchButton.addEventListener("click", render);
    }
    render();
  }

  document.querySelectorAll("[data-filter-bar]").forEach(function (bar) {
    const scope = bar.parentElement.querySelector("[data-filter-scope]");
    if (!scope) return;
    const cards = Array.from(scope.querySelectorAll("[data-card]"));

    function isNew(card) {
      const y = Number(card.dataset.year || 0);
      return y >= 2024;
    }

    function matches(card, filter) {
      const type = String(card.dataset.type || "");
      const region = String(card.dataset.region || "");
      const genre = String(card.dataset.genre || "");
      if (filter === "all") return true;
      if (filter === "movie") return type.indexOf("电影") !== -1 || type.indexOf("Movie") !== -1;
      if (filter === "series") return type.indexOf("剧") !== -1 || type.indexOf("Series") !== -1 || type.indexOf("综艺") !== -1;
      if (filter === "new") return isNew(card);
      if (filter === "hot") return genre.indexOf("悬疑") !== -1 || genre.indexOf("动作") !== -1 || genre.indexOf("剧情") !== -1;
      if (filter === "china") return region.indexOf("中国") !== -1 || region.indexOf("香港") !== -1 || region.indexOf("台湾") !== -1;
      if (filter === "western") return region.indexOf("美国") !== -1 || region.indexOf("英国") !== -1 || region.indexOf("法国") !== -1 || region.indexOf("欧美") !== -1;
      return true;
    }

    bar.querySelectorAll("[data-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        const filter = button.dataset.filter || "all";
        bar.querySelectorAll("[data-filter]").forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        cards.forEach(function (card) {
          card.classList.toggle("is-hidden", !matches(card, filter));
        });
      });
    });
  });

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const existing = document.querySelector("script[src='" + src + "']");
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  let hlsLoadPromise = null;

  function getHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (!hlsLoadPromise) {
      hlsLoadPromise = loadScript("https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js").then(function () {
        return window.Hls;
      });
    }
    return hlsLoadPromise;
  }

  document.querySelectorAll("[data-player]").forEach(function (player) {
    const video = player.querySelector("video");
    const trigger = player.querySelector(".play-cover");
    const src = player.dataset.stream;
    let attached = false;

    function attach() {
      if (!video || !src) return Promise.resolve();
      if (attached) return Promise.resolve();
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return Promise.resolve();
      }

      return getHls().then(function (Hls) {
        if (Hls && Hls.isSupported && Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          video.hlsPlayer = hls;
          return new Promise(function (resolve) {
            hls.on(Hls.Events.MANIFEST_PARSED, resolve);
            window.setTimeout(resolve, 1600);
          });
        }
        video.src = src;
        return Promise.resolve();
      }).catch(function () {
        video.src = src;
      });
    }

    function start() {
      player.classList.add("is-ready");
      attach().then(function () {
        const playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      });
    }

    if (trigger) {
      trigger.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-ready");
      });
    }
  });
})();
