/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Read the script content
const scriptContent = fs.readFileSync(path.resolve(__dirname, 'script.js'), 'utf8');

describe('script.js functionality', () => {
  let domContentLoadedCallback;
  let observeMock;
  let unobserveMock;
  let navbar;

  beforeAll(() => {
    // Capture the DOMContentLoaded listener
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

    // Execute the script content to register the listener
    eval(scriptContent);

    // Find the callback
    const call = addEventListenerSpy.mock.calls.find(call => call[0] === 'DOMContentLoaded');
    if (call) {
      domContentLoadedCallback = call[1];
    } else {
        throw new Error("DOMContentLoaded listener not found");
    }

    addEventListenerSpy.mockRestore();
  });

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <nav class="navbar pt-4"></nav>
      <div class="reveal"></div>
      <div class="reveal-text"></div>
      <div class="reveal-img"></div>
    `;

    navbar = document.querySelector('.navbar');

    // Make window.scrollY writable
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });

    // Mock IntersectionObserver
    observeMock = jest.fn();
    unobserveMock = jest.fn();
    global.IntersectionObserver = jest.fn((callback, options) => {
      global.observerCallback = callback;
      return {
        observe: observeMock,
        unobserve: unobserveMock,
        disconnect: jest.fn(),
      };
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    // Reset scroll position
    window.scrollY = 0;
  });

  test('Initializes IntersectionObserver and observes elements', () => {
    domContentLoadedCallback();

    const revealElements = document.querySelectorAll(".reveal, .reveal-text, .reveal-img");
    expect(observeMock).toHaveBeenCalledTimes(revealElements.length);
    revealElements.forEach(el => {
        expect(observeMock).toHaveBeenCalledWith(el);
    });
  });

  test('Adds active class when element intersects', () => {
    domContentLoadedCallback();

    const revealElement = document.querySelector('.reveal');

    const entries = [{
      target: revealElement,
      isIntersecting: true
    }];

    const observerInstance = { unobserve: unobserveMock };
    global.observerCallback(entries, observerInstance);

    expect(revealElement.classList.contains('active')).toBe(true);
    expect(unobserveMock).toHaveBeenCalledWith(revealElement);
  });

  test('Does not add active class when element does not intersect', () => {
    domContentLoadedCallback();

    const revealElement = document.querySelector('.reveal');

    const entries = [{
      target: revealElement,
      isIntersecting: false
    }];

    const observerInstance = { unobserve: unobserveMock };
    global.observerCallback(entries, observerInstance);

    expect(revealElement.classList.contains('active')).toBe(false);
    expect(unobserveMock).not.toHaveBeenCalled();
  });

  test('Navbar changes style on scroll', () => {
    domContentLoadedCallback();

    // Default state
    expect(navbar.classList.contains('navbar-scrolled')).toBe(false);
    expect(navbar.classList.contains('pt-4')).toBe(true);

    // Scroll down
    window.scrollY = 100;
    window.dispatchEvent(new Event('scroll'));

    expect(navbar.classList.contains('navbar-scrolled')).toBe(true);
    expect(navbar.classList.contains('shadow-sm')).toBe(true);
    expect(navbar.classList.contains('py-2')).toBe(true);
    expect(navbar.classList.contains('pt-4')).toBe(false);

    // Scroll up
    window.scrollY = 0;
    window.dispatchEvent(new Event('scroll'));

    expect(navbar.classList.contains('navbar-scrolled')).toBe(false);
    expect(navbar.classList.contains('shadow-sm')).toBe(false);
    expect(navbar.classList.contains('py-2')).toBe(false);
    expect(navbar.classList.contains('pt-4')).toBe(true);
  });

  test('Initial load sequence forces active class on hero elements', () => {
    domContentLoadedCallback();

    const heroText = document.querySelector('.reveal-text');
    const heroImg = document.querySelector('.reveal-img');

    expect(heroText.classList.contains('active')).toBe(false);
    expect(heroImg.classList.contains('active')).toBe(false);

    jest.advanceTimersByTime(100);

    expect(heroText.classList.contains('active')).toBe(true);
    expect(heroImg.classList.contains('active')).toBe(true);
  });
});
