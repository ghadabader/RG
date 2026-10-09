"use client";

// Shared form shell for the auth pages. It is a plain HTML form post, so it works without
// JavaScript; with JavaScript the password field also gets a show/hide toggle.
// Pages pass the raw ?error= codes; this component turns them into field and form messages.
import { useId, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

export type AuthField = {
  name: "email" | "password";
  label: string;
  autoComplete: string;
};

type Props = {
  title: string;
  action: string;
  submitLabel: string;
  fields: AuthField[];
  errors?: string[];
  notice?: string;
  children?: ReactNode;
};

const FIELD_ERROR = { email: "invalid_email", password: "password_too_short" } as const;
const FORM_ERRORS = [
  "invalid_credentials",
  "email_taken",
  "rate_limited",
  "unavailable",
  "expired",
  "same_password",
] as const;

export default function AuthForm({ title, action, submitLabel, fields, errors = [], notice, children }: Props) {
  const t = useTranslations("auth.errors");
  const formError = FORM_ERRORS.find((code) => errors.includes(code));
  return (
    <main>
      <h1>{title}</h1>
      {notice && <p role="status">{notice}</p>}
      {formError && <p role="alert">{t(formError)}</p>}
      <form method="post" action={action} noValidate>
        {fields.map((field) => {
          const code = FIELD_ERROR[field.name];
          const error = errors.includes(code) ? t(code) : undefined;
          return field.name === "password" ? (
            <PasswordField key={field.name} field={field} error={error} />
          ) : (
            <EmailField key={field.name} field={field} error={error} />
          );
        })}
        <button type="submit">{submitLabel}</button>
      </form>
      {children}
    </main>
  );
}

type FieldProps = { field: AuthField; error?: string };

function EmailField({ field, error }: FieldProps) {
  const id = useId();
  return (
    <p>
      <label htmlFor={id}>{field.label}</label>
      <input
        id={id}
        name={field.name}
        type="email"
        required
        autoComplete={field.autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <span id={`${id}-error`}>{error}</span>}
    </p>
  );
}

function PasswordField({ field, error }: FieldProps) {
  const id = useId();
  const t = useTranslations("auth");
  const [visible, setVisible] = useState(false);
  return (
    <p>
      <label htmlFor={id}>{field.label}</label>
      <input
        id={id}
        name={field.name}
        type={visible ? "text" : "password"}
        required
        minLength={8}
        autoComplete={field.autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <button type="button" aria-controls={id} aria-pressed={visible} onClick={() => setVisible(!visible)}>
        {visible ? t("hidePassword") : t("showPassword")}
      </button>
      {error && <span id={`${id}-error`}>{error}</span>}
    </p>
  );
}
