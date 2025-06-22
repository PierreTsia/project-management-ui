/**
 * Password validation regex pattern
 * Must contain at least:
 * - 8 characters
 * - 1 lowercase letter
 * - 1 uppercase letter
 * - 1 number
 * - 1 special character (@$!%*?&)
 */
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
