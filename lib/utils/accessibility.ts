/**
 * Accessibility utilities for the booking system
 */

/**
 * Announce a message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Skip to main content functionality
 */
export function setupSkipToMainContent() {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:bg-primary focus:text-white focus:p-2 focus:rounded';
  
  document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Ensure keyboard navigation works properly
 */
export function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // Escape key closes any open modals
    if (e.key === 'Escape') {
      const openElements = document.querySelectorAll('[role="dialog"]');
      openElements.forEach((el) => {
        const closeButton = el.querySelector('[aria-label*="close"]') as HTMLElement;
        closeButton?.click();
      });
    }
  });
}

/**
 * Trap focus within a modal or important section
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  element.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  });
}
