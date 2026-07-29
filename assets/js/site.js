(function () {
	'use strict';

	document.documentElement.classList.add('js');

	document.addEventListener('DOMContentLoaded', function () {
		var root = document.documentElement;
		var body = document.body;
		var main = document.querySelector('main');
		var footer = document.querySelector('footer');
		var skipLink = document.querySelector('.skip-link');
		var header = document.querySelector('[data-site-header]');
		var headerUtility = document.querySelector('.header-utility');
		var brand = document.querySelector('.brand');
		var heroMedia = document.querySelector('[data-hero-media]');
		var progress = document.querySelector('[data-scroll-progress]');
		var progressTracks = Array.prototype.slice.call(document.querySelectorAll('[data-progress-track]'));
		var menuToggle = document.querySelector('[data-menu-toggle]');
		var navigation = document.getElementById('site-navigation');
		var mobileQuery = window.matchMedia('(max-width: 980px)');
		var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		var scrollFrame = 0;

		function updateProgress() {
			var scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
			var ratio = Math.max(0, Math.min(1, window.scrollY / scrollable));

			if (progress) {
				progress.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
			}

			if (header) {
				header.classList.toggle('is-scrolled', window.scrollY > 12);
			}

			if (heroMedia) {
				var heroShift = reduceMotion ? 0 : Math.max(0, Math.min(1, window.scrollY / (window.innerHeight * 0.7)));
				heroMedia.style.setProperty('--hero-shift', heroShift.toFixed(4));
			}

			progressTracks.forEach(function (track) {
				var rect = track.getBoundingClientRect();
				var distance = window.innerHeight * 0.82 + rect.height;
				var trackRatio = reduceMotion ? 1 : (window.innerHeight * 0.82 - rect.top) / distance;
				trackRatio = Math.max(0, Math.min(1, trackRatio));
				track.style.setProperty('--story-progress', trackRatio.toFixed(4));
			});

			scrollFrame = 0;
		}

		function requestProgressUpdate() {
			if (!scrollFrame) {
				scrollFrame = window.requestAnimationFrame(updateProgress);
			}
		}

		updateProgress();
		window.addEventListener('scroll', requestProgressUpdate, { passive: true });
		window.addEventListener('resize', requestProgressUpdate, { passive: true });

		function menuIsOpen() {
			return Boolean(navigation && navigation.classList.contains('is-open'));
		}

		function setMenu(open, returnFocus) {
			if (!menuToggle || !navigation) {
				return;
			}

			var shouldOpen = mobileQuery.matches && open;
			navigation.classList.toggle('is-open', shouldOpen);
			menuToggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
			menuToggle.setAttribute('aria-label', shouldOpen ? 'Close menu' : 'Open menu');
			body.classList.toggle('menu-open', shouldOpen);

			[main, footer, skipLink, headerUtility, brand].forEach(function (element) {
				if (element) {
					element.inert = shouldOpen;
					if (shouldOpen) {
						element.setAttribute('aria-hidden', 'true');
					} else {
						element.removeAttribute('aria-hidden');
					}
				}
			});

			if (mobileQuery.matches) {
				navigation.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
				navigation.inert = !shouldOpen;
			} else {
				navigation.removeAttribute('aria-hidden');
				navigation.inert = false;
			}

			if (returnFocus) {
				menuToggle.focus();
			} else if (shouldOpen) {
				var firstLink = navigation.querySelector('a[href]');
				if (firstLink) {
					window.setTimeout(function () {
						firstLink.focus({ preventScroll: true });
					}, 30);
				}
			}
		}

		if (menuToggle && navigation) {
			setMenu(false, false);

			menuToggle.addEventListener('click', function () {
				setMenu(!menuIsOpen(), false);
			});

			navigation.addEventListener('click', function (event) {
				if (event.target.closest('a')) {
					setMenu(false, false);
				}
			});

			document.addEventListener('click', function (event) {
				if (menuIsOpen() && !navigation.contains(event.target) && !menuToggle.contains(event.target)) {
					setMenu(false, false);
				}
			});

			document.addEventListener('keydown', function (event) {
				if (event.key === 'Escape' && menuIsOpen()) {
					setMenu(false, true);
					return;
				}

				if (event.key === 'Tab' && menuIsOpen()) {
					var focusable = [menuToggle].concat(Array.prototype.slice.call(navigation.querySelectorAll('a[href]')));
					var first = focusable[0];
					var last = focusable[focusable.length - 1];

					if (event.shiftKey && document.activeElement === first) {
						event.preventDefault();
						last.focus();
					} else if (!event.shiftKey && document.activeElement === last) {
						event.preventDefault();
						first.focus();
					}
				}
			});

			if (mobileQuery.addEventListener) {
				mobileQuery.addEventListener('change', function () {
					setMenu(false, false);
				});
			}
		}

		var revealSelector = [
			'.ia-hero-stats > div',
			'.ia-impact-item',
			'.ia-editorial-card',
			'.ia-work-card',
			'.ia-policy-card',
			'.ia-story-step',
			'.ia-news-card',
			'.ia-statement',
			'.story-timeline article',
			'.leadership-card',
			'.value-grid article',
			'.advocacy-grid article',
			'.committee-grid article',
			'.media-card',
			'.resource-card',
			'.feature-card',
			'.email-contact-card',
			'.editorial-figure',
			'.footer-cta-inner'
		].join(',');
		var revealItems = Array.prototype.slice.call(document.querySelectorAll(revealSelector));
		var revealObserver = null;

		function animateCounters(container) {
			var counters = container.querySelectorAll('[data-counter]');

			counters.forEach(function (counter) {
				if (counter.dataset.animated === 'true') {
					return;
				}

				var target = Number(counter.getAttribute('data-target'));
				if (!Number.isFinite(target)) {
					return;
				}

				counter.dataset.animated = 'true';
				if (reduceMotion) {
					counter.textContent = String(target);
					return;
				}

				var started = performance.now();
				var duration = 820;
				counter.textContent = '0';

				function step(now) {
					var elapsed = Math.min(1, (now - started) / duration);
					var eased = 1 - Math.pow(1 - elapsed, 3);
					counter.textContent = String(Math.round(target * eased));
					if (elapsed < 1) {
						window.requestAnimationFrame(step);
					}
				}

				window.requestAnimationFrame(step);
			});
		}

		function reveal(item, animateVisibleCounters) {
			item.classList.add('is-visible');
			if (animateVisibleCounters) {
				animateCounters(item);
			}
			if (revealObserver) {
				revealObserver.unobserve(item);
			}
		}

		if (!reduceMotion && 'IntersectionObserver' in window) {
			revealObserver = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						reveal(entry.target, true);
					}
				});
			}, {
				threshold: 0.08,
				rootMargin: '0px 0px -4% 0px'
			});

			revealItems.forEach(function (item, index) {
				if (item.getBoundingClientRect().top > window.innerHeight * 1.02) {
					item.classList.add('reveal-item');
					item.style.setProperty('--reveal-delay', String((index % 4) * 65) + 'ms');
					revealObserver.observe(item);
				} else {
					animateCounters(item);
				}
			});
		} else {
			revealItems.forEach(function (item) {
				reveal(item, true);
			});
		}

		var mediaGrid = document.querySelector('[data-media-grid]');
		var mediaSearch = document.querySelector('[data-media-search]');
		var resultCount = document.querySelector('[data-media-result-count]');
		var emptyState = document.querySelector('[data-media-empty]');
		var filterToolbar = document.querySelector('.filter-toolbar');
		var mediaCards = mediaGrid ? Array.prototype.slice.call(mediaGrid.querySelectorAll('[data-media-category]')) : [];
		var activeFilter = 'all';

		function updateMediaLibrary() {
			var query = mediaSearch ? mediaSearch.value.trim().toLowerCase() : '';
			var visible = 0;

			mediaCards.forEach(function (card) {
				var category = card.getAttribute('data-media-category') || '';
				var content = (card.getAttribute('data-media-text') || card.textContent || '').toLowerCase();
				var matchesFilter = activeFilter === 'all' || category === activeFilter;
				var matchesSearch = !query || content.indexOf(query) !== -1;
				var show = matchesFilter && matchesSearch;

				card.hidden = !show;
				card.classList.remove('is-filtered-out');
				if (show) {
					visible += 1;
				}
			});

			if (resultCount) {
				resultCount.textContent = 'Showing ' + visible + (visible === 1 ? ' reference' : ' references');
			}

			if (emptyState) {
				emptyState.hidden = visible !== 0;
			}
		}

		if (filterToolbar && mediaCards.length) {
			filterToolbar.querySelectorAll('[data-media-filter]').forEach(function (button) {
				button.setAttribute('aria-pressed', button.classList.contains('is-active') ? 'true' : 'false');
			});

			filterToolbar.addEventListener('click', function (event) {
				var button = event.target.closest('[data-media-filter]');
				if (!button) {
					return;
				}

				activeFilter = button.getAttribute('data-media-filter') || 'all';
				filterToolbar.querySelectorAll('[data-media-filter]').forEach(function (item) {
					var active = item === button;
					item.classList.toggle('is-active', active);
					item.setAttribute('aria-pressed', active ? 'true' : 'false');
				});
				updateMediaLibrary();
			});
		}

		if (mediaSearch && mediaCards.length) {
			mediaSearch.addEventListener('input', updateMediaLibrary);
		}

		if (mediaCards.length) {
			updateMediaLibrary();
		}

		root.classList.add('site-ready');
	});
}());
