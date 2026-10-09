// Shared by the forms and the routes: a well-formed email, and a password of at least
// 8 characters with no composition rules (Spec 0001).
export const MIN_PASSWORD_LENGTH = 8;

export type FieldErrors = {
  email?: "invalid_email";
  password?: "password_too_short";
};

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

export function validateCredentials(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!validateEmail(email)) errors.email = "invalid_email";
  if (!validatePassword(password)) errors.password = "password_too_short";
  return errors;
}
