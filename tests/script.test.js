/**
 * @jest-environment jsdom
 */

describe('Scroll Animations', () => {
  let observeMock;
  let unobserveMock;
  let intersectionObserverMock;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div class="reveal"></div>
      <div class="reveal-text"></div>
      <div class="reveal-img"></div>
      <div class="navbar"></div>
    `;

    // Mock IntersectionObserver
    observeMock = jest.fn();
    unobserveMock = jest.fn();

    // Create a mock implementation that captures the callback
    intersectionObserverMock = jest.fn((callback, options) => {
      // Store the callback on the mock instance so we can invoke it later
      const instance = {
        observe: observeMock,
        unobserve: unobserveMock,
        disconnect: jest.fn(),
        takeRecords: jest.fn(),
      };

      // Store callback on the mock function itself for easy access in tests
      intersectionObserverMock.lastCallback = callback;
      intersectionObserverMock.lastOptions = options;

      return instance;
    });

    // Assign mock to global
    global.IntersectionObserver = intersectionObserverMock;

    // Reset modules so we can re-require the script
    jest.resetModules();
  });

  test('initializes IntersectionObserver and observes elements', () => {
    // Load the script
    require('../js/script.js');

    // Trigger DOMContentLoaded manually since we missed the real event during require
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Check if IntersectionObserver was instantiated
    expect(intersectionObserverMock).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ threshold: 0.1 })
    );

    // Check if elements are observed
    const elements = document.querySelectorAll('.reveal, .reveal-text, .reveal-img');
    expect(observeMock).toHaveBeenCalledTimes(elements.length);
    elements.forEach(el => {
      expect(observeMock).toHaveBeenCalledWith(el);
    });
  });

  test('adds active class when element intersects', () => {
    require('../js/script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const [revealEl] = document.querySelectorAll('.reveal');

    // Get the callback passed to the observer
    const callback = intersectionObserverMock.lastCallback;

    // Simulate intersection
    const entries = [{
      target: revealEl,
      isIntersecting: true
    }];

    // Execute callback
    // The second argument to the callback is the observer instance itself
    const observerInstance = { unobserve: unobserveMock };
    callback(entries, observerInstance);

    expect(revealEl.classList.contains('active')).toBe(true);
    expect(unobserveMock).toHaveBeenCalledWith(revealEl);
  });

  test('does not add active class when element does not intersect', () => {
    require('../js/script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const [revealEl] = document.querySelectorAll('.reveal');

    const callback = intersectionObserverMock.lastCallback;

    // Simulate non-intersection
    const entries = [{
      target: revealEl,
      isIntersecting: false
    }];

    const observerInstance = { unobserve: unobserveMock };
    callback(entries, observerInstance);

    expect(revealEl.classList.contains('active')).toBe(false);
    expect(unobserveMock).not.toHaveBeenCalled();
  });
});
