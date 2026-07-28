(function () {
	'use strict';

	document.addEventListener('DOMContentLoaded', function () {
		var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		var header = document.querySelector('[data-site-header]');
		var progress = document.querySelector('[data-scroll-progress]');
		var toggle = document.querySelector('[data-menu-toggle]');
		var navigation = document.getElementById('site-navigation');
		var mobileRevealQuery = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;

		function shouldDisableReveal() {
			return reduceMotion || !('IntersectionObserver' in window) || (mobileRevealQuery && mobileRevealQuery.matches);
		}

		function updateHeader() {
			if (!header) {
				return;
			}

			header.classList.toggle('is-scrolled', window.scrollY > 12);

			if (progress) {
				var maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
				progress.style.transform = 'scaleX(' + Math.min(window.scrollY / maxScroll, 1) + ')';
			}
		}

		updateHeader();
		window.addEventListener('scroll', updateHeader, { passive: true });

		if (toggle && navigation) {
			document.documentElement.classList.add('has-menu-js');

			function closeMenu(focusToggle) {
				if (!navigation.classList.contains('is-open')) {
					return;
				}

				navigation.classList.remove('is-open');
				toggle.setAttribute('aria-expanded', 'false');
				document.body.classList.remove('has-open-menu');

				if (focusToggle) {
					toggle.focus();
				}
			}

			toggle.addEventListener('click', function () {
				var isOpen = navigation.classList.toggle('is-open');
				toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
				document.body.classList.toggle('has-open-menu', isOpen);
			});

			navigation.addEventListener('click', function (event) {
				if (event.target && event.target.tagName === 'A') {
					closeMenu(false);
				}
			});

			document.addEventListener('click', function (event) {
				if (
					navigation.classList.contains('is-open') &&
					!navigation.contains(event.target) &&
					!toggle.contains(event.target)
				) {
					closeMenu(false);
				}
			});

			document.addEventListener('keydown', function (event) {
				if (event.key === 'Escape') {
					closeMenu(true);
				}
			});
		}

		var revealSelectors = [
			'.ia-reveal',
			'.ia-editorial-card',
			'.ia-work-card',
			'.ia-policy-card',
			'.ia-story-step',
			'.ia-news-card',
			'.ia-impact-item',
			'.ia-statement',
			'.ia-prose .iaid-page-intro',
			'.ia-prose .compact-section',
			'.value-grid article',
			'.advocacy-grid article',
			'.committee-grid article',
			'.team-grid article',
			'.resource-grid article',
			'.contact-info-grid article',
			'.media-card',
			'.iaid-form',
			'.footer-grid > *'
		].join(',');

		var revealItems = Array.prototype.slice.call(document.querySelectorAll(revealSelectors));
		var seen = [];

		revealItems.forEach(function (item) {
			if (seen.indexOf(item) === -1) {
				seen.push(item);
			}
		});

		if (seen.length) {
			if (shouldDisableReveal()) {
				seen.forEach(function (item) {
					item.classList.add('is-visible');
					item.style.transitionDelay = '0ms';
				});
			} else {
				document.documentElement.classList.add('has-reveal-js');

				var revealObserver = new IntersectionObserver(function (entries) {
					entries.forEach(function (entry) {
						if (entry.isIntersecting) {
							entry.target.classList.add('is-visible');
							revealObserver.unobserve(entry.target);
						}
					});
				}, {
					threshold: 0.12,
					rootMargin: '0px 0px -8% 0px'
				});

				seen.forEach(function (item, index) {
					item.classList.add('ia-reveal');
					item.style.transitionDelay = Math.min(index % 8, 7) * 45 + 'ms';
					revealObserver.observe(item);
				});

				window.setTimeout(function () {
					seen.forEach(function (item) {
						if (!item.classList.contains('is-visible')) {
							item.classList.add('is-visible');
							item.style.transitionDelay = '0ms';
						}
					});
				}, 3600);
			}
		}

		var hero = document.querySelector('[data-iaid-scene]');

		if (hero && !reduceMotion) {
			hero.addEventListener('pointermove', function (event) {
				var rect = hero.getBoundingClientRect();
				var x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
				var y = ((event.clientY - rect.top) / rect.height - 0.5) * 18;
				hero.style.setProperty('--hero-shift-x', x.toFixed(2) + 'px');
				hero.style.setProperty('--hero-shift-y', y.toFixed(2) + 'px');
			});

			hero.addEventListener('pointerleave', function () {
				hero.style.setProperty('--hero-shift-x', '0px');
				hero.style.setProperty('--hero-shift-y', '0px');
			});
		}

		function animateCounter(counter) {
			var target = parseInt(counter.getAttribute('data-target'), 10);
			var start = null;
			var duration = 1100;

			if (!target || counter.getAttribute('data-counted') === 'true') {
				return;
			}

			counter.setAttribute('data-counted', 'true');

			if (reduceMotion) {
				counter.textContent = target;
				return;
			}

			function frame(timestamp) {
				if (!start) {
					start = timestamp;
				}

				var progress = Math.min((timestamp - start) / duration, 1);
				var eased = 1 - Math.pow(1 - progress, 3);
				counter.textContent = Math.round(target * eased);

				if (progress < 1) {
					window.requestAnimationFrame(frame);
				} else {
					counter.textContent = target;
				}
			}

			window.requestAnimationFrame(frame);
		}

		var counters = document.querySelectorAll('[data-counter]');

		if (counters.length) {
			if (reduceMotion || !('IntersectionObserver' in window)) {
				counters.forEach(animateCounter);
			} else {
				var counterObserver = new IntersectionObserver(function (entries) {
					entries.forEach(function (entry) {
						if (entry.isIntersecting) {
							animateCounter(entry.target);
							counterObserver.unobserve(entry.target);
						}
					});
				}, { threshold: 0.55 });

				counters.forEach(function (counter) {
					counterObserver.observe(counter);
				});
			}
		}

		var filterButtons = document.querySelectorAll('[data-media-filter]');
		var cards = document.querySelectorAll('[data-media-category]');
		var searchInput = document.querySelector('[data-media-search]');
		var resultCount = document.querySelector('[data-media-result-count]');
		var activeFilter = 'all';

		if (filterButtons.length && cards.length) {
			function updateMediaCards() {
				var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
				var visibleCount = 0;

				cards.forEach(function (card) {
					var category = card.getAttribute('data-media-category');
					var text = card.getAttribute('data-media-text') || '';
					var matchesFilter = activeFilter === 'all' || category === activeFilter;
					var matchesSearch = !query || text.indexOf(query) !== -1;
					var shouldShow = matchesFilter && matchesSearch;

					if (shouldShow) {
						visibleCount += 1;
						card.hidden = false;
						window.requestAnimationFrame(function () {
							card.classList.remove('is-filtered-out');
						});
					} else if (reduceMotion) {
						card.hidden = true;
					} else {
						card.classList.add('is-filtered-out');
						window.setTimeout(function () {
							if (card.classList.contains('is-filtered-out')) {
								card.hidden = true;
							}
						}, 210);
					}
				});

				if (resultCount) {
					resultCount.textContent = 'Showing ' + visibleCount + (visibleCount === 1 ? ' reference' : ' references');
				}
			}

			filterButtons.forEach(function (button) {
				button.setAttribute('aria-pressed', button.classList.contains('is-active') ? 'true' : 'false');

				button.addEventListener('click', function () {
					activeFilter = button.getAttribute('data-media-filter');

					filterButtons.forEach(function (item) {
						var isActive = item === button;
						item.classList.toggle('is-active', isActive);
						item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
					});

					updateMediaCards();
				});
			});

			if (searchInput) {
				searchInput.addEventListener('input', updateMediaCards);
			}

			updateMediaCards();
		}
	});
}());

(function () {
	'use strict';

	document.documentElement.classList.add('js-enabled');

	document.addEventListener('DOMContentLoaded', function () {
		var root = document.documentElement;
		var reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
		var finePointerQuery = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : null;
		var mobileMenuQuery = window.matchMedia ? window.matchMedia('(max-width: 980px)') : null;
		var reduceMotion = reduceMotionQuery ? reduceMotionQuery.matches : false;
		var finePointer = finePointerQuery ? finePointerQuery.matches : false;
		var canObserve = 'IntersectionObserver' in window;

		function setDelay(element, delay) {
			element.style.setProperty('--motion-delay', delay + 'ms');
		}

		function addMotionItem(element, style, delay) {
			if (!element) {
				return;
			}

			element.classList.add('motion-reveal', style || 'motion-rise');
			setDelay(element, delay || 0);
		}

		/* Homepage hero: one deliberate sequence, complete in about one second. */
		var hero = document.querySelector('[data-iaid-scene]');

		if (hero) {
			var identity = hero.querySelector('.ia-identity-lockup');
			var titleLines = hero.querySelectorAll('.ia-hero-title > span');
			var subtitle = hero.querySelector('.ia-hero-subtitle');
			var heroButtons = hero.querySelectorAll('.ia-actions .ia-button');
			var logoWrap = hero.querySelector('.ia-hero-logo-wrap');
			var heroStats = hero.querySelectorAll('.ia-hero-stat');

			if (identity) {
				identity.classList.add('motion-hero-item');
				setDelay(identity, 20);
			}

			titleLines.forEach(function (line, index) {
				line.classList.add('motion-hero-item');
				setDelay(line, 60 + index * 48);
			});

			if (subtitle) {
				subtitle.classList.add('motion-hero-item');
				setDelay(subtitle, 270);
			}

			heroButtons.forEach(function (button, index) {
				button.classList.add('motion-hero-item');
				setDelay(button, 305 + index * 38);
			});

			if (logoWrap) {
				logoWrap.classList.add('motion-hero-item', 'motion-hero-logo');
				setDelay(logoWrap, 330);
			}

			heroStats.forEach(function (stat, index) {
				stat.classList.add('motion-hero-item');
				setDelay(stat, 350 + index * 40);
			});
		}

		/* Page heroes use masked hierarchy without changing their markup. */
		document.querySelectorAll('.ia-page-hero-inner').forEach(function (pageHero) {
			Array.prototype.slice.call(pageHero.children).forEach(function (child, index) {
				addMotionItem(child, index === 1 ? 'motion-mask' : 'motion-rise', index * 75);
			});
		});

		/* Existing sections and cards receive varied, reusable reveal treatments. */
		var surfaceSelector = [
			'.ia-editorial-card',
			'.ia-work-card',
			'.ia-policy-card',
			'.ia-news-card',
			'.ia-story-step',
			'.ia-impact-item',
			'.ia-statement',
			'.story-timeline article',
			'.value-grid article',
			'.team-grid article',
			'.advocacy-grid article',
			'.committee-grid article',
			'.resource-card',
			'.contact-info-grid article',
			'.media-card',
			'.email-contact-card',
			'.iaid-form'
		].join(',');
		var surfaces = document.querySelectorAll(surfaceSelector);

		surfaces.forEach(function (surface, index) {
			var style = index % 3 === 0 ? 'motion-scale' : (index % 3 === 1 ? 'motion-from-left' : 'motion-from-right');
			surface.classList.add('motion-surface');
			addMotionItem(surface, style, (index % 6) * 58);
		});

		var contentSelector = [
			'.ia-section-head',
			'.iaid-page-intro',
			'.compact-section',
			'.feature-card',
			'.president-note',
			'.story-transition',
			'.advocacy-dashboard-strip',
			'.resource-category-head',
			'.disclaimer-box',
			'.footer-grid > *'
		].join(',');

		document.querySelectorAll(contentSelector).forEach(function (item, index) {
			addMotionItem(item, index % 4 === 0 ? 'motion-mask' : 'motion-rise', (index % 5) * 52);
		});

		var motionItems = document.querySelectorAll('.motion-reveal');
		var motionObserver = null;

		if (reduceMotion || !canObserve) {
			motionItems.forEach(function (item) {
				item.classList.add('motion-in');
				setDelay(item, 0);
			});
		} else {
			motionObserver = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add('motion-in');
						motionObserver.unobserve(entry.target);
					}
				});
			}, {
				threshold: 0.12,
				rootMargin: '0px 0px -9% 0px'
			});

			motionItems.forEach(function (item) {
				motionObserver.observe(item);
			});
		}

		root.classList.add('motion-ready');

		if (hero) {
			if (reduceMotion) {
				hero.classList.add('is-introduced');
			} else {
				window.requestAnimationFrame(function () {
					window.requestAnimationFrame(function () {
						hero.classList.add('is-introduced');
					});
				});
			}
		}

		/* Safety net: enhancements can never leave readable content hidden. */
		window.setTimeout(function () {
			motionItems.forEach(function (item) {
				if (!item.classList.contains('motion-in')) {
					item.classList.add('motion-in');
					setDelay(item, 0);
				}
			});
		}, 2400);

		/* Section continuity and timeline milestone state. */
		var sections = document.querySelectorAll('main > section, .resource-category');

		sections.forEach(function (section) {
			section.classList.add('motion-section');
		});

		if (canObserve && !reduceMotion) {
			var sectionObserver = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					entry.target.classList.toggle('is-section-active', entry.isIntersecting);
				});
			}, {
				threshold: 0.16,
				rootMargin: '-12% 0px -42% 0px'
			});

			sections.forEach(function (section) {
				sectionObserver.observe(section);
			});
		} else {
			sections.forEach(function (section) {
				section.classList.add('is-section-active');
			});
		}

		var timeline = document.querySelector('.story-timeline');
		var timelineTicking = false;

		function updateTimeline() {
			if (!timeline) {
				return;
			}

			var rect = timeline.getBoundingClientRect();
			var travel = rect.height + window.innerHeight * 0.45;
			var progress = Math.max(0, Math.min(1, (window.innerHeight * 0.72 - rect.top) / travel));
			timeline.style.setProperty('--timeline-progress', reduceMotion ? 1 : progress.toFixed(3));
			timelineTicking = false;
		}

		if (timeline) {
			updateTimeline();
			window.addEventListener('scroll', function () {
				if (!timelineTicking) {
					timelineTicking = true;
					window.requestAnimationFrame(updateTimeline);
				}
			}, { passive: true });
			window.addEventListener('resize', updateTimeline);

			if (canObserve && !reduceMotion) {
				var milestoneObserver = new IntersectionObserver(function (entries) {
					entries.forEach(function (entry) {
						entry.target.classList.toggle('is-milestone-active', entry.isIntersecting);
					});
				}, { threshold: 0.48 });

				timeline.querySelectorAll('article').forEach(function (milestone) {
					milestoneObserver.observe(milestone);
				});
			} else {
				timeline.querySelectorAll('article').forEach(function (milestone) {
					milestone.classList.add('is-milestone-active');
				});
			}
		}

		/* Fine-pointer depth only: small values preserve stable hit targets. */
		if (finePointer && !reduceMotion) {
			surfaces.forEach(function (surface) {
				surface.addEventListener('pointermove', function (event) {
					var rect = surface.getBoundingClientRect();
					var px = (event.clientX - rect.left) / rect.width;
					var py = (event.clientY - rect.top) / rect.height;
					surface.style.setProperty('--surface-x', (px * 100).toFixed(1) + '%');
					surface.style.setProperty('--surface-y', (py * 100).toFixed(1) + '%');
					surface.style.setProperty('--surface-rx', ((0.5 - py) * 3.2).toFixed(2) + 'deg');
					surface.style.setProperty('--surface-ry', ((px - 0.5) * 3.2).toFixed(2) + 'deg');
				});

				surface.addEventListener('pointerleave', function () {
					surface.style.setProperty('--surface-rx', '0deg');
					surface.style.setProperty('--surface-ry', '0deg');
				});
			});

			var magneticItems = document.querySelectorAll('.ia-button, .button, .resource-button, .email-link, .primary-menu > li:last-child > a');

			magneticItems.forEach(function (item) {
				item.addEventListener('pointermove', function (event) {
					var rect = item.getBoundingClientRect();
					var x = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
					var y = ((event.clientY - rect.top) / rect.height - 0.5) * 5;
					item.style.setProperty('--magnet-x', x.toFixed(2) + 'px');
					item.style.setProperty('--magnet-y', y.toFixed(2) + 'px');
				});

				item.addEventListener('pointerleave', function () {
					item.style.setProperty('--magnet-x', '0px');
					item.style.setProperty('--magnet-y', '0px');
				});
			});

			if (hero) {
				hero.addEventListener('pointermove', function (event) {
					var rect = hero.getBoundingClientRect();
					hero.style.setProperty('--hero-pointer-x', (((event.clientX - rect.left) / rect.width) * 100).toFixed(1) + '%');
					hero.style.setProperty('--hero-pointer-y', (((event.clientY - rect.top) / rect.height) * 100).toFixed(1) + '%');
				});
			}
		}

		/* Mobile menu remains operable without JS; with JS, hidden links become inert. */
		var menuToggle = document.querySelector('[data-menu-toggle]');
		var navigation = document.getElementById('site-navigation');

		function syncMenuAccessibility() {
			if (!menuToggle || !navigation) {
				return;
			}

			var mobile = mobileMenuQuery ? mobileMenuQuery.matches : false;
			var open = navigation.classList.contains('is-open');
			var shouldHide = mobile && !open;
			navigation.inert = shouldHide;

			if (shouldHide) {
				navigation.setAttribute('aria-hidden', 'true');
			} else {
				navigation.removeAttribute('aria-hidden');
			}
		}

		if (menuToggle && navigation) {
			navigation.querySelectorAll('.primary-menu > li').forEach(function (item, index) {
				item.style.setProperty('--menu-index', index);
			});

			syncMenuAccessibility();
			var menuObserver = new MutationObserver(syncMenuAccessibility);
			menuObserver.observe(navigation, { attributes: true, attributeFilter: ['class'] });

			if (mobileMenuQuery && mobileMenuQuery.addEventListener) {
				mobileMenuQuery.addEventListener('change', syncMenuAccessibility);
			}
		}

		/* Media filtering feedback augments the existing accessible controls. */
		var mediaGrid = document.querySelector('[data-media-grid]');
		var mediaResult = document.querySelector('[data-media-result-count]');
		var mediaControls = document.querySelector('.media-controls');
		var filterToolbar = document.querySelector('.filter-toolbar');
		var mediaPulseTimer = null;

		function beginMediaFeedback() {
			if (!mediaGrid) {
				return;
			}

			mediaGrid.classList.add('is-filtering');
			window.setTimeout(function () {
				mediaGrid.classList.remove('is-filtering');
			}, 240);
		}

		if (mediaGrid && mediaResult) {
			mediaResult.setAttribute('aria-atomic', 'true');
			var resultObserver = new MutationObserver(function () {
				mediaResult.classList.remove('is-updating');
				window.requestAnimationFrame(function () {
					mediaResult.classList.add('is-updating');
				});

				window.clearTimeout(mediaPulseTimer);
				mediaPulseTimer = window.setTimeout(function () {
					mediaResult.classList.remove('is-updating');
				}, 420);
			});
			resultObserver.observe(mediaResult, { childList: true, characterData: true, subtree: true });
		}

		if (mediaControls) {
			mediaControls.addEventListener('input', beginMediaFeedback);
		}

		if (filterToolbar) {
			filterToolbar.addEventListener('click', beginMediaFeedback);
		}

		/* Ambient animations stop when the page is not visible. */
		function syncVisibility() {
			root.classList.toggle('motion-paused', document.hidden);
		}

		document.addEventListener('visibilitychange', syncVisibility);
		syncVisibility();
	});
}());
