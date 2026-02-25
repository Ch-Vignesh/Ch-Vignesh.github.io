/**
 * @jest-environment jsdom
 */

describe('Navbar Scroll Behavior', () => {
  let init;
  let navbar;
  let scrollHandler;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <nav class="navbar pt-4">
      </nav>
      <div class="reveal-text"></div>
      <div class="reveal-img"></div>
    `;
    navbar = document.querySelector('.navbar');

    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // Mock window.addEventListener to capture scroll handler
    jest.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'scroll') {
        scrollHandler = handler;
      }
    });

    // Use fake timers
    jest.useFakeTimers();

    // Load module
    jest.resetModules();
    // We expect the script to export an init function or we will modify it to do so
    try {
        const scriptModule = require('../script.js');
        init = scriptModule.init;
    } catch (e) {
        console.error("Could not load script.js module", e);
    }

    // Run init if available
    if (init) {
        init();
    }
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('should have initial state', () => {
    expect(navbar.classList.contains('pt-4')).toBe(true);
    expect(navbar.classList.contains('navbar-scrolled')).toBe(false);
  });

  test('should add scrolled classes when window.scrollY > 50', () => {
    // Set scrollY
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });

    // Trigger handler directly
    expect(scrollHandler).toBeDefined();
    scrollHandler();

    expect(navbar.classList.contains('navbar-scrolled')).toBe(true);
    expect(navbar.classList.contains('shadow-sm')).toBe(true);
    expect(navbar.classList.contains('py-2')).toBe(true);
    expect(navbar.classList.contains('pt-4')).toBe(false);
  });

  test('should remove scrolled classes when window.scrollY <= 50', () => {
    // First scroll down
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    if (scrollHandler) scrollHandler();

    expect(navbar.classList.contains('navbar-scrolled')).toBe(true);

    // Then scroll up
    Object.defineProperty(window, 'scrollY', { value: 40, writable: true });
    if (scrollHandler) scrollHandler();

    expect(navbar.classList.contains('navbar-scrolled')).toBe(false);
    expect(navbar.classList.contains('shadow-sm')).toBe(false);
    expect(navbar.classList.contains('py-2')).toBe(false);
    expect(navbar.classList.contains('pt-4')).toBe(true);
  });
});
