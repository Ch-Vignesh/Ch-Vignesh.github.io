/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Initial Load Sequence', () => {
  let heroText, heroImg;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <nav class="navbar pt-4"></nav>
      <div class="reveal-text"></div>
      <div class="reveal-img"></div>
    `;

    heroText = document.querySelector('.reveal-text');
    heroImg = document.querySelector('.reveal-img');

    // Mock IntersectionObserver (needed because script.js uses it)
    global.IntersectionObserver = class IntersectionObserver {
      constructor(callback, options) {
        this.callback = callback;
        this.options = options;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  test('should add "active" class to hero elements after 100ms delay on load', () => {
    // Read script content
    const scriptPath = path.resolve(__dirname, '../js/script.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');

    // execute the script to attach the event listener
    eval(scriptContent);

    // Verify initial state
    expect(heroText.classList.contains('active')).toBe(false);
    expect(heroImg.classList.contains('active')).toBe(false);

    // Trigger DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);

    // Still shouldn't be active immediately
    expect(heroText.classList.contains('active')).toBe(false);
    expect(heroImg.classList.contains('active')).toBe(false);

    // Fast-forward time by 100ms
    jest.advanceTimersByTime(100);

    // Now they should be active
    expect(heroText.classList.contains('active')).toBe(true);
    expect(heroImg.classList.contains('active')).toBe(true);
  });
});
