import React from 'react';

// ===== BUTTON =====
export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-gradient-to-br from-[#c9a84c] to-[#e8c97a] text-black hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(201,168,76,0.35)]',
    ghost: 'border border-[var(--border)] text-[var(--text)] hover:border-[var(--border-hover)] hover:text-[var(--gold-light)] hover:bg-[rgba(201,168,76,0.1)]',
    danger: 'bg-[rgba(232,92,92,0.15)] border border-[rgba(232,92,92,0.3)] text-[#e85c5c] hover:bg-[rgba(232,92,92,0.25)]',
    outline: 'border border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--border-hover)] hover:text-[var(--gold-light)]',
  };
  const sizes = {
    sm: 'px-4 py-2 text-[11px] rounded',
    md: 'px-9 py-3.5 text-[13px] rounded',
    lg: 'px-12 py-[18px] text-[15px] rounded',
    full: 'w-full px-9 py-3.5 text-[13px] rounded',
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// ===== BADGE =====
export const Badge = ({ children, color = 'gold' }) => {
  const colors = {
    gold: 'bg-[#c9a84c] text-black',
    green: 'bg-[rgba(76,175,110,0.2)] text-[#6fca6f] border border-[rgba(76,175,110,0.3)]',
    red: 'bg-[rgba(232,92,92,0.15)] text-[#e85c5c] border border-[rgba(232,92,92,0.2)]',
    amber: 'bg-[rgba(232,169,76,0.15)] text-[#c9a84c] border border-[rgba(201,168,76,0.3)]',
  };
  return (
    <span className={`inline-block text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm ${colors[color]}`}>
      {children}
    </span>
  );
};

// ===== SECTION EYEBROW =====
export const Eyebrow = ({ children }) => (
  <div className="text-[11px] tracking-[0.2em] uppercase text-[#c9a84c] font-semibold mb-4">
    {children}
  </div>
);

// ===== FORM INPUT =====
export const FormGroup = ({ label, children, className = '' }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {label && <label className="text-[11px] tracking-widest uppercase text-[var(--text-muted)]">{label}</label>}
    {children}
  </div>
);

export const Input = React.forwardRef(({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={`bg-[var(--input-bg)] border border-[var(--border)] rounded px-4 py-3 text-[var(--text)] font-[Inter] text-[15px] transition-all focus:outline-none focus:border-[var(--border-hover)] focus:shadow-[0_0_0_3px_var(--gold-glow)] placeholder:text-[var(--text-ghost)] ${className}`}
    {...props}
  />
));

export const Textarea = React.forwardRef(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={`bg-[var(--input-bg)] border border-[var(--border)] rounded px-4 py-3 text-[var(--text)] font-[Inter] text-[15px] transition-all focus:outline-none focus:border-[var(--border-hover)] focus:shadow-[0_0_0_3px_var(--gold-glow)] placeholder:text-[var(--text-ghost)] resize-y ${className}`}
    {...props}
  />
));

export const Select = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <select
    ref={ref}
    className={`bg-[var(--input-bg)] border border-[var(--border)] rounded px-4 py-3 text-[var(--text)] font-[Inter] text-[15px] transition-all focus:outline-none focus:border-[var(--border-hover)] cursor-pointer ${className}`}
    {...props}
  >
    {children}
  </select>
));

// ===== SWATCH =====
export const Swatch = ({ pattern, className = '' }) => (
  <div
    className={`rounded-md ${className}`}
    style={{ background: pattern }}
  />
);

// ===== LOADING SPINNER =====
export const Spinner = ({ size = 24 }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
    className="animate-spin"
    style={{ color: 'var(--gold)' }}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// ===== GOLD DIVIDER =====
export const GoldDivider = () => (
  <div className="w-full h-px bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.4)] to-transparent" />
);
