import { useState } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { AREAS_LABEL, type Area } from "@/lib/store";

export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
      {error ? (
        <span className="text-xs text-destructive">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

const baseInput =
  "w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`${baseInput} ${className}`} />;
}

export function NumericInput({
  value,
  onChange,
  className = "",
  placeholder,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: number;
  onChange: (n: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState("");
  const formatted = value > 0 ? new Intl.NumberFormat("es-CO").format(value) : "";

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      className={`${baseInput} ${className}`}
      value={editing ? raw : formatted}
      onFocus={(e) => {
        setEditing(true);
        setRaw(value > 0 ? value.toString() : "");
        setTimeout(() => e.target.select(), 0);
      }}
      onBlur={() => {
        setEditing(false);
        const n = Number(raw.replace(/\D/g, ""));
        onChange(isNaN(n) ? 0 : n);
      }}
      onChange={(e) => setRaw(e.target.value.replace(/\D/g, ""))}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", rows = 3, ...rest } = props;
  return <textarea rows={rows} {...rest} className={`${baseInput} ${className}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <select {...rest} className={`${baseInput} ${className}`}>
      {children}
    </select>
  );
}

type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
type BtnSize = "sm" | "md";

const BTN_VARIANTS: Record<BtnVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground",
  secondary:
    "bg-surface border border-border text-foreground hover:bg-muted disabled:bg-muted disabled:text-muted-foreground",
  ghost:
    "bg-transparent text-foreground hover:bg-muted disabled:text-muted-foreground",
  danger:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:bg-muted disabled:text-muted-foreground",
};
const BTN_SIZES: Record<BtnSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: {
  variant?: BtnVariant;
  size?: BtnSize;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed ${BTN_VARIANTS[variant]} ${BTN_SIZES[size]} ${className}`}
    />
  );
}

const ALL_AREAS: Area[] = ["comercial", "compras", "produccion", "administrativa"];

// Lista de áreas seleccionables. Permite asignar a un usuario una o más áreas.
export function AreasChecklist({
  value,
  onChange,
  disabled,
}: {
  value: Area[];
  onChange: (next: Area[]) => void;
  disabled?: boolean;
}) {
  const toggle = (a: Area) => {
    if (disabled) return;
    if (value.includes(a)) {
      // No permitir quedarse sin ninguna área asignada.
      if (value.length === 1) return;
      onChange(value.filter((x) => x !== a));
    } else {
      onChange([...value, a]);
    }
  };
  return (
    <div className="grid grid-cols-2 gap-2">
      {ALL_AREAS.map((a) => {
        const checked = value.includes(a);
        return (
          <label
            key={a}
            className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
              checked
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border bg-surface text-foreground hover:bg-muted"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={() => toggle(a)}
              className="h-4 w-4"
            />
            <span>{AREAS_LABEL[a]}</span>
          </label>
        );
      })}
    </div>
  );
}
