// Go tests, go
describe('Deck JS', function() {
	describe('standard html structure', function() {
		beforeEach(function() {
			loadFixtures('standard.html');
			if (Modernizr.history) {
				history.replaceState({}, "", "#")
			}
			else {
				window.location.hash = '#';
			}
		});

		describe('init(selector)', function() {
			it('should create slides', function() {
				$.deck('.slide');
				expect($.deck('getSlides').length).toEqual($('.slide').length);
			});
		});

		describe('init([selectors])', function() {
			it('should create slides', function() {
				$.deck([
					'.slide1',
					'.slide2',
					'.slide3',
					'.slide4',
					'.slide5'
				]);
				expect($.deck('getSlides').length).toEqual($('.slide').length);
			});
		});

		describe('navigation functions', function() {
			beforeEach(function() {
				$.deck('.slide');
			});

			describe('go(i)', function() {
				it('should go to the i slide (0 based index)', function() {
					$.deck('go', 3);
					expect($.deck('getSlide')).toHaveClass('slide4');
				});

				it('should go to the slide with specified id', function() {
					$.deck('go', 'custom-id');
					expect($.deck('getSlide')).toHaveId('custom-id');
				});

				it('should go nowhere if i is out of bounds', function() {
					$.deck('go', 5);
					expect($.deck('getSlide')).toHaveClass('slide1');
				});

				it('should go nowhere if id does not exist', function() {
					$.deck('go', 'i-dont-exist');
					expect($.deck('getSlide')).toHaveClass('slide1');
				});
			});

			describe('next()', function() {
				it('should go to the next slide', function() {
					$.deck('next');
					expect($.deck('getSlide')).toHaveClass('slide2');
				});

				it('should go nowhere if on the last slide', function() {
					$.deck('go', 4);
					$.deck('next');
					expect($.deck('getSlide')).toHaveClass('slide5');
				});
			});

			describe('prev()', function() {
				it('should go to the previous slide', function() {
					$.deck('go', 2);
					$.deck('prev');
					expect($.deck('getSlide')).toHaveClass('slide2');
				});

				it('should go nowhere if on the first slide', function() {
					$.deck('prev');
					expect($.deck('getSlide')).toHaveClass('slide1');
				});
			});
		});

		describe('getters', function() {
			beforeEach(function() {
				$.deck('.slide');
			});

			describe('getSlide()', function() {
				it('should get the current slide', function() {
					expect($.deck('getSlide')).toHaveClass('slide1');
					$.deck('go', 2);
					expect($.deck('getSlide')).toHaveClass('slide3');
				});
			});

			describe('getSlide(i)', function() {
				it('should get slide number i (0 based index)', function() {
					expect($.deck('getSlide', 1)).toHaveClass('slide2');
					expect($.deck('getSlide', 3)).toHaveClass('slide4');
				});

				it('should return null if i is NaN', function() {
					expect($.deck('getSlide', 'barfoo')).toBeNull();
				});

				it('should return null if i is out of bounds', function() {
					expect($.deck('getSlide', 6)).toBeNull();
				});
			});

			describe('getSlides()', function() {
				it('should return an array of jQuery objects for each slide', function() {
					var expectation = [],
					slides = $.deck('getSlides');
					$('.slide').each(function() {
						expectation.push($(this));
					});
					expect(slides).toEqual(expectation);
				});
			});

			describe('getContainer()', function() {
				it('should return a jQuery object with the container element(s)', function() {
					expect($.deck('getContainer')).toBe(defaults.selectors.container);
				});
			});

			describe('getOptions()', function() {
				it('should return the current options object', function() {
					expect($.deck('getOptions')).toEqual(defaults);
				});
			});
		});

		describe('container states', function() {
			beforeEach(function() {
				$.deck('.slide');
			});

			it('should start at state 0', function() {
				expect($(defaults.selectors.container)).toHaveClass(defaults.classes.onPrefix + '0');
			});

			it('should change states with the slide number', function() {
				$.deck('next');
				expect($(defaults.selectors.container)).toHaveClass(defaults.classes.onPrefix + '1');
				$.deck('go', 3);
				expect($(defaults.selectors.container)).toHaveClass(defaults.classes.onPrefix + '3');
				$.deck('prev');
				expect($(defaults.selectors.container)).toHaveClass(defaults.classes.onPrefix + '2');
			});
		});

		describe('options object', function() {
			var $d = $(document);

			beforeEach(function() {
				$.deck('.alt-slide', {
					classes: {
						after: 'alt-after',
						before: 'alt-before',
						current: 'alt-current',
						onPrefix: 'alt-on-',
						next: 'alt-next',
						previous: 'alt-prev'
					},

					selectors: {
						container: '.alt-container'
					},

					keys: {
						next: 87,
						previous: 69
					}
				});
			});

			describe('classes', function() {
				it('should use the specified after class', function() {
					expect($('.alt-slide3, .alt-slide4, .alt-slide5')).toHaveClass('alt-after');
				});

				it('should use the specified before class', function() {
					$.deck('go', 4);
					expect($('.alt-slide1, .alt-slide2, .alt-slide3')).toHaveClass('alt-before');
				});

				it('should use the specified container class', function() {
					$.deck('go', 2);
					expect($('.alt-container')).toHaveClass('alt-on-2');
				});

				it('should use the specified current class', function() {
					expect($.deck('getSlide')).toHaveClass('alt-current');
				});

				it('should use the specified next class', function() {
					expect($('.alt-slide2')).toHaveClass('alt-next');
				});

				it('should use the specified previous class', function() {
					$.deck('next');
					expect($('.alt-slide1')).toHaveClass('alt-prev');
				});
			});

			describe('key bindings', function() {
				var e;

				beforeEach(function() {
					e = jQuery.Event('keydown.deck');
				});

				it('should go to the next slide using the specified key', function() {
					e.which = 87; // 'w'
					$d.trigger(e);
					expect($.deck('getSlide')).toHaveClass('alt-slide2');
				});

				it('should go to the previous slide using the specified key', function() {
					$.deck('next');
					e.which = 69; // 'e'
					$d.trigger(e);
					expect($.deck('getSlide')).toHaveClass('alt-slide1');
				});

				it('should not trigger events that originate within editable elements', function() {
					var $outside = $('<input type="text" />').appendTo('body');
					e = jQuery.Event('keydown');
					e.which = 87;
					$outside.trigger(e);
					expect($.deck('getSlide')).toHaveClass('alt-slide1');
					$outside.remove();
				});
			});
		});

		describe('events', function() {
			var $d = $(document);

			beforeEach(function() {
				spyOnEvent($d, 'deck.init');
				spyOnEvent($d, 'deck.beforeInit');
				$.deck('.slide');
				$.deck('go', 1);
				spyOnEvent($d, 'deck.change');
			});

			describe('deck.change', function() {
				it('should fire on go(i)', function() {
					$.deck('go', 3);
					expect('deck.change').toHaveBeenTriggeredOn($d);
				});

				it('should fire on next()', function() {
					$.deck('next');
					expect('deck.change').toHaveBeenTriggeredOn($d);
				});

				it('should fire on prev()', function() {
					$.deck('prev');
					expect('deck.change').toHaveBeenTriggeredOn($d);
				});

				it('should pass parameters with from and to indices', function() {
					var f = function(e, from, to) {
						expect(from).toEqual(1);
						expect(to).toEqual(3);
					};

					$d.bind('deck.change', f);
					$.deck('go', 3);
					$d.unbind('deck.change', f);
				});

				it('should not fire if default prevented in beforeChange', function() {
					$d.bind('deck.beforeChange', false);
					$.deck('go', 3);
					expect($.deck('getSlide')).toEqual($.deck('getSlide', 1));
					$d.unbind('deck.beforeChange', false);
				});
			});

			describe('deck.init', function() {
				it('should fire on deck initialization', function() {
					expect('deck.init').toHaveBeenTriggeredOn($d);
				});

				it('should have already populated the slides array', function() {
					var f = function() {
						expect($.deck('getSlides').length).toBeGreaterThan(0);
					};

					$d.bind('deck.init', f);
					$.deck('.slide');
					$d.unbind('deck.init', f);
				});
			});

			describe('deck.beforeInit', function() {
				it('should fire on deck initialization', function() {
					expect('deck.beforeInit').toHaveBeenTriggeredOn($d);
				});

				it('should have not populated the slides array', function() {
					var f = function() {
						expect($.deck('getSlides').length).toEqual(0);
					};

					$d.bind('deck.beforeInit', f);
					$.deck('.slide');
					$d.unbind('deck.beforeInit', f);
				});
			});
		});
	});

	describe('empty deck', function() {
		beforeEach(function() {
			loadFixtures('empty.html');
			$.deck('.slide');
		});

		describe('getSlide()', function() {
			it('should not error on init', $.noop);
		});
	});
});
