(function () {
	'use strict';

	document.addEventListener('DOMContentLoaded', function () {
		var journey = document.querySelector('[data-story-journey]');
		if (!journey) {
			return;
		}

		var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		var wideViewportQuery = window.matchMedia('(min-width: 761px)');
		var reduceMotion = reduceMotionQuery.matches;
		var reveals = Array.prototype.slice.call(journey.querySelectorAll('.story-reveal'));
		var chapters = Array.prototype.slice.call(journey.querySelectorAll('[data-story-chapter]'));
		var navigationLinks = Array.prototype.slice.call(journey.querySelectorAll('[data-story-nav]'));
		var progressIndicator = journey.querySelector('[data-story-progress]');
		var chapterContainer = journey.querySelector('.story-journey-chapters');
		var depthElements = Array.prototype.slice.call(journey.querySelectorAll('[data-story-depth]'));
		var frame = 0;
		var activeChapterId = '';

		function showAllContent() {
			reveals.forEach(function (item) {
				item.classList.add('is-visible');
			});
		}

		if (!reduceMotion && 'IntersectionObserver' in window) {
			journey.classList.add('story-motion-enabled');
			var revealObserver = new IntersectionObserver(function (entries, observer) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
						observer.unobserve(entry.target);
					}
				});
			}, {
				rootMargin: '0px 0px -10% 0px',
				threshold: 0.12
			});

			reveals.forEach(function (item) {
				revealObserver.observe(item);
			});
		} else {
			showAllContent();
		}

		function setCurrentChapter(chapterId) {
			if (chapterId === activeChapterId) {
				return;
			}
			var activeLink = null;
			navigationLinks.forEach(function (link) {
				if (link.getAttribute('data-story-nav') === chapterId) {
					link.setAttribute('aria-current', 'step');
					activeLink = link;
				} else {
					link.removeAttribute('aria-current');
				}
			});
			activeChapterId = chapterId;

			if (!wideViewportQuery.matches && activeLink) {
				var strip = activeLink.closest('ol');
				if (strip) {
					var targetLeft = activeLink.offsetLeft - (strip.clientWidth - activeLink.offsetWidth) * 0.5;
					strip.scrollTo({ left: Math.max(0, targetLeft), behavior: reduceMotion ? 'auto' : 'smooth' });
				}
			}
		}

		function updateJourney() {
			var viewportHeight = window.innerHeight || document.documentElement.clientHeight;

			if (chapterContainer && progressIndicator) {
				var chapterRect = chapterContainer.getBoundingClientRect();
				var progressDistance = Math.max(chapterRect.height - viewportHeight * 0.45, 1);
				var progressRatio = (viewportHeight * 0.42 - chapterRect.top) / progressDistance;
				progressRatio = Math.max(0, Math.min(1, progressRatio));
				progressIndicator.style.setProperty('--story-section-progress', progressRatio.toFixed(4));
			}

			var currentChapter = chapters[0];
			chapters.forEach(function (chapter) {
				if (chapter.getBoundingClientRect().top <= viewportHeight * 0.48) {
					currentChapter = chapter;
				}
			});
			if (currentChapter) {
				setCurrentChapter(currentChapter.id);
			}

			if (!reduceMotion && wideViewportQuery.matches) {
				depthElements.forEach(function (element) {
					var rect = element.getBoundingClientRect();
					if (rect.bottom < -120 || rect.top > viewportHeight + 120) {
						return;
					}
					var depth = Number(element.getAttribute('data-story-depth')) || 0;
					var centreOffset = viewportHeight * 0.5 - (rect.top + rect.height * 0.5);
					var shift = Math.max(-24, Math.min(24, (centreOffset / viewportHeight) * 220 * depth));
					element.style.setProperty('--story-shift', shift.toFixed(2) + 'px');
				});
			} else {
				depthElements.forEach(function (element) {
					element.style.removeProperty('--story-shift');
				});
			}

			frame = 0;
		}

		function requestJourneyUpdate() {
			if (!frame) {
				frame = window.requestAnimationFrame(updateJourney);
			}
		}

		function alignHashChapter() {
			if (!window.location.hash || window.location.hash.indexOf('#story-chapter-') !== 0) {
				return;
			}
			var target = document.querySelector(window.location.hash);
			if (!target) {
				return;
			}
			window.requestAnimationFrame(function () {
				window.requestAnimationFrame(function () {
					target.scrollIntoView({ block: 'start', behavior: 'auto' });
					requestJourneyUpdate();
				});
			});
		}

		setCurrentChapter(chapters[0] ? chapters[0].id : '');
		updateJourney();
		window.addEventListener('scroll', requestJourneyUpdate, { passive: true });
		window.addEventListener('resize', requestJourneyUpdate, { passive: true });
		window.addEventListener('load', alignHashChapter, { once: true });
		window.addEventListener('hashchange', alignHashChapter);
		alignHashChapter();

		if (reduceMotionQuery.addEventListener) {
			reduceMotionQuery.addEventListener('change', function (event) {
				reduceMotion = event.matches;
				if (reduceMotion) {
					journey.classList.remove('story-motion-enabled');
					showAllContent();
				}
				requestJourneyUpdate();
			});
		}

		if (wideViewportQuery.addEventListener) {
			wideViewportQuery.addEventListener('change', requestJourneyUpdate);
		}
	});
}());
