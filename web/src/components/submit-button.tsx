"use client";

import { useFormStatus } from "react-dom";

/**
 * Shows the action is actually running - a demo button that looks dead is worse
 * than none.
 *
 * `name`/`value` matter: the submitter's pair is what tells the action WHICH
 * button was pressed. Never pair these with a hidden input of the same name -
 * FormData.get() returns the first match and the button is ignored.
 */
export function SubmitButton({
  children,
  pendingLabel,
  className,
  disabled,
  name,
  value,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className: string;
  disabled?: boolean;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      className={className}
      disabled={pending || disabled}
    >
      {pending ? (pendingLabel ?? "Working…") : children}
    </button>
  );
}
