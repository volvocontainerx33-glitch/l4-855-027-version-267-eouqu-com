(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupSiteSearch() {
    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (!value) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function filterItems(scope) {
    var searchInput = scope.querySelector("[data-filter-search]");
    var yearSelect = scope.querySelector("[data-filter-year]");
    var query = normalize(searchInput && searchInput.value);
    var year = normalize(yearSelect && yearSelect.value);
    var container = scope.parentElement || document;
    var items = container.querySelectorAll(".filter-item");
    items.forEach(function (item) {
      var text = normalize([
        item.dataset.title,
        item.dataset.genre,
        item.dataset.year,
        item.dataset.region,
        item.dataset.tags
      ].join(" "));
      var itemYear = normalize(item.dataset.year);
      var matchesText = !query || text.indexOf(query) !== -1;
      var matchesYear = !year || itemYear === year;
      item.classList.toggle("is-hidden", !(matchesText && matchesYear));
    });
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var searchInput = scope.querySelector("[data-filter-search]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var clearButton = scope.querySelector("[data-clear-filter]");
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && searchInput) {
        searchInput.value = q;
      }
      [searchInput, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", function () {
            filterItems(scope);
          });
          control.addEventListener("change", function () {
            filterItems(scope);
          });
        }
      });
      if (clearButton) {
        clearButton.addEventListener("click", function () {
          if (searchInput) {
            searchInput.value = "";
          }
          if (yearSelect) {
            yearSelect.value = "";
          }
          filterItems(scope);
        });
      }
      filterItems(scope);
    });
  }

  ready(function () {
    setupMobileMenu();
    setupSiteSearch();
    setupFilters();
  });
})();
