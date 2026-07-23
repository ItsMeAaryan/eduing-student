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
        <Search size={15} className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={1.8} />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => {
            onChange?.(e);
            onSearch?.(e.target.value);
          }}
          placeholder={placeholder}
          className={`w-full h-[40px] pl-[40px] pr-[16px] bg-white border border-[#EAECF0] rounded-[10px] text-[13.5px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F6BFF] focus:ring-2 focus:ring-[#4F6BFF]/10 transition-all ${className}`}
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
    default: 'bg-[#F3F4F6] text-[#6B7280]',
    success: 'bg-[#F0FDF4] text-[#059669]',
    warning: 'bg-[#FFFBEB] text-[#D97706]',
    danger: 'bg-[#FEF2F2] text-[#DC2626]',
    info: 'bg-[#EEF2FF] text-[#4F6BFF]',
    purple: 'bg-[#F5F3FF] text-[#7C3AED]',
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
    <div className={`bg-white border border-[#EAECF0] rounded-[14px] p-[24px] flex flex-col gap-[20px] ${className}`}>
      <div>
        <h3 className="text-[16px] font-semibold text-[#111827]">{title}</h3>
        {description && <p className="text-[13px] text-[#6B7280] mt-[2px]">{description}</p>}
      </div>
      <div className="flex flex-col gap-[16px]">{children}</div>
    </div>
  );
};
