import React from 'react';
import { LucideIcon, Search } from 'lucide-react';

/** SearchInput - Standardized Search Bar for lists & tables */
export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  containerClassName?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onSearch, placeholder = 'Search...', containerClassName = '', className = '', ...props }, ref) => {
    return (
      <div className={`relative flex-1 min-w-[200px] ${containerClassName}`}>
        <Search size={15} className="absolute left-[14px] top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={1.8} />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => {
            onChange?.(e);
            onSearch?.(e.target.value);
          }}
          placeholder={placeholder}
          className={`w-full h-[40px] pl-[40px] pr-[16px] bg-card border border-border rounded-[14px] text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all ${className}`}
          {...props}
        />
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

/** StatusBadge - Standardized Badge pill for application/document statuses */
export interface StatusBadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  icon?: LucideIcon;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'default',
  icon: Icon,
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-secondary text-muted-foreground',
    success: 'bg-[color-mix(in_srgb,_var(--green)_9%,_transparent)] text-[var(--green)]',
    warning: 'bg-[var(--gold-bg)] text-[var(--gold)]',
    danger: 'bg-[color-mix(in_srgb,_var(--red)_8%,_transparent)] text-[var(--red)]',
    info: 'bg-primary/10 text-[var(--accent)]',
    purple: 'bg-[var(--accent-bg)] text-[var(--accent)]',
  };

  return (
    <span
      className={`inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-full text-[11px] font-semibold whitespace-nowrap ${variantStyles[variant]} ${className}`}
    >
      {Icon && <Icon size={11} strokeWidth={2} />}
      {label}
    </span>
  );
};

/** FormSection - Standardized layout wrapper for form field groups */
export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-card border border-border rounded-[20px] p-[24px] flex flex-col gap-[20px] ${className}`}>
      <div>
        <h3 className="text-[16px] font-semibold text-foreground">{title}</h3>
        {description && <p className="text-[13px] text-muted-foreground mt-[2px]">{description}</p>}
      </div>
      <div className="flex flex-col gap-[16px]">{children}</div>
    </div>
  );
};
