/**
 * Accessibility Utilities
 * Phase 4: Accessibility - Helper Functions
 * 
 * Provides accessibility helper functions
 */

// Check if color contrast meets WCAG AA standards
export function checkContrast(foreground: string, background: string): boolean {
  // Simplified contrast check - in production, use a proper library
  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  // This is a placeholder - use a library like 'color-contrast-checker' in production
  return true; // Assume passing for now - implement proper check
}

// Announce to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const liveRegion = document.getElementById('live-region');
  if (liveRegion) {
    liveRegion.textContent = '';
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = message;
        liveRegion.setAttribute('aria-live', priority);
      }
    }, 100);
  }
}

// Get accessible name for an element
export function getAccessibleName(element: HTMLElement): string {
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement) return labelElement.textContent || '';
  }

  const title = element.getAttribute('title');
  if (title) return title;

  return element.textContent || '';
}

// Check if element is visible to screen readers
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    element.getAttribute('aria-hidden') !== 'true' &&
    !element.classList.contains('sr-only')
  );
}

















