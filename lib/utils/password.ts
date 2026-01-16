/**
 * Password validation and strength calculation utilities
 */

export interface PasswordStrength {
  score: number; // 0-5
  label: 'Weak' | 'Fair' | 'Good' | 'Strong' | '';
  color: string;
}

/**
 * Calculate password strength score (0-5)
 */
export function calculatePasswordStrength(password: string): number {
  if (!password) return 0;

  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  return Math.min(strength, 5);
}

/**
 * Get password strength label and color
 */
export function getPasswordStrengthLabel(strength: number): PasswordStrength {
  if (strength === 0) {
    return { score: 0, label: '', color: '' };
  }
  if (strength <= 2) {
    return { score: strength, label: 'Weak', color: 'text-red-600' };
  }
  if (strength <= 3) {
    return { score: strength, label: 'Fair', color: 'text-yellow-600' };
  }
  if (strength <= 4) {
    return { score: strength, label: 'Good', color: 'text-blue-600' };
  }
  return { score: strength, label: 'Strong', color: 'text-green-600' };
}

/**
 * Get password strength bar color class
 */
export function getPasswordStrengthBarColor(strength: number): string {
  if (strength <= 2) return 'bg-red-500';
  if (strength <= 3) return 'bg-yellow-500';
  if (strength <= 4) return 'bg-blue-500';
  return 'bg-green-500';
}

/**
 * Validate password strength
 * Returns error message or null if valid
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (password.length > 128) {
    return 'Password must be less than 128 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
}

/**
 * Check if password meets minimum requirements
 */
export function isPasswordValid(password: string): boolean {
  return validatePassword(password) === null;
}



