document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHeroSlides();
    setupFilters();
    setupHeroSearch();
});

function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
        return;
    }
    toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
    });
}

function setupHeroSlides() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
        return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
        index = next;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("active", i === index);
        });
    }

    function play() {
        timer = window.setInterval(function () {
            show((index + 1) % slides.length);
        }, 4600);
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
            window.clearInterval(timer);
            show(i);
            play();
        });
    });

    show(0);
    play();
}

function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
        var scopeName = panel.getAttribute("data-filter-panel");
        var scope = document.querySelector('[data-filter-scope="' + scopeName + '"]');
        if (!scope) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        var search = panel.querySelector('[data-filter="search"]');
        var type = panel.querySelector('[data-filter="type"]');
        var region = panel.querySelector('[data-filter="region"]');
        var year = panel.querySelector('[data-filter="year"]');
        var empty = document.querySelector('[data-empty-for="' + scopeName + '"]');

        function text(value) {
            return (value || "").toString().toLowerCase().trim();
        }

        function apply() {
            var q = text(search && search.value);
            var t = text(type && type.value);
            var r = text(region && region.value);
            var y = text(year && year.value);
            var shown = 0;

            cards.forEach(function (card) {
                var haystack = text([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre")
                ].join(" "));
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (t && text(card.getAttribute("data-type")).indexOf(t) === -1) {
                    ok = false;
                }
                if (r && text(card.getAttribute("data-region")).indexOf(r) === -1) {
                    ok = false;
                }
                if (y && text(card.getAttribute("data-year")) !== y) {
                    ok = false;
                }
                card.style.display = ok ? "" : "none";
                if (ok) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.style.display = shown ? "none" : "block";
            }
        }

        [search, type, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    });
}

function setupHeroSearch() {
    var form = document.querySelector(".hero-search");
    if (!form) {
        return;
    }
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var value = input ? input.value.trim() : "";
        var target = "./search.html";
        if (value) {
            target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
    });
}

function initSearchQuery() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (!query) {
        return;
    }
    var input = document.querySelector('[data-filter="search"]');
    if (!input) {
        return;
    }
    input.value = query;
    input.dispatchEvent(new Event("input", { bubbles: true }));
}

window.addEventListener("DOMContentLoaded", initSearchQuery);

window.initMoviePlayer = function (boxId, videoId, source) {
    var box = document.getElementById(boxId);
    var video = document.getElementById(videoId);
    if (!box || !video || !source) {
        return;
    }
    var cover = box.querySelector(".player-cover");
    var message = box.querySelector(".player-message");
    var started = false;
    var hls = null;

    function writeMessage(value) {
        if (message) {
            message.textContent = value || "";
        }
    }

    function load() {
        if (started) {
            return;
        }
        started = true;
        writeMessage("");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    writeMessage("播放加载暂时受阻，请稍后重试");
                }
            });
        } else {
            writeMessage("当前环境暂时无法加载播放内容");
            return;
        }
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                writeMessage("请再次点击播放");
            });
        }
    }

    if (cover) {
        cover.addEventListener("click", load);
    }
    video.addEventListener("click", function () {
        if (!started) {
            load();
        }
    });
    video.addEventListener("play", function () {
        if (cover) {
            cover.classList.add("is-hidden");
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
};
