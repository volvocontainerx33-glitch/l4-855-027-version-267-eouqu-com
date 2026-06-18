(function () {
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var categoryCards = Array.prototype.slice.call(document.querySelectorAll('.category-movies .movie-card'));

  function applyCategoryFilter() {
    if (!categoryCards.length) {
      return;
    }

    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';

    categoryCards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var yearMatched = !year || card.getAttribute('data-year') === year;
      var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
      card.style.display = yearMatched && keywordMatched ? '' : 'none';
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyCategoryFilter);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyCategoryFilter);
  }

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage && window.SEARCH_DATA) {
    var input = document.querySelector('[data-search-input]');
    var select = document.querySelector('[data-search-category]');
    var button = document.querySelector('[data-search-button]');
    var results = document.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function cardTemplate(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<a class="movie-card" href="./' + movie.file + '" data-title="' + escapeHtml(movie.title) + '">' +
        '<div class="card-cover">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="card-badge">' + escapeHtml(movie.category) + '</span>' +
        '<span class="score-badge">' + escapeHtml(movie.score) + '</span>' +
        '</div>' +
        '<div class="card-body">' +
        '<h3>' + escapeHtml(movie.title) + '</h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</a>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        }[char];
      });
    }

    function renderSearch() {
      if (!results) {
        return;
      }

      var keyword = input ? input.value.trim().toLowerCase() : '';
      var category = select ? select.value : '';
      var matched = window.SEARCH_DATA.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.genre,
          movie.year,
          movie.category,
          movie.tags.join(' '),
          movie.oneLine
        ].join(' ').toLowerCase();
        var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
        var categoryMatched = !category || movie.category === category;
        return keywordMatched && categoryMatched;
      }).slice(0, 240);

      results.innerHTML = matched.map(cardTemplate).join('');
    }

    if (button) {
      button.addEventListener('click', renderSearch);
    }

    if (input) {
      input.addEventListener('input', renderSearch);
    }

    if (select) {
      select.addEventListener('change', renderSearch);
    }

    renderSearch();
  }
})();
