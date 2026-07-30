import React from 'react';
import { LucideIcon, Search, Eye, EyeOff, ChevronDown, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// TYPOGRAPHY
// ==========================================
export const H1 = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <h1 className={`text-[24px] md:text-[28px] font-semibold text-foreground tracking-tight ${className}`}>{children}</h1>
);
export const H2 = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <h2 className={`text-[20px] md:text-[22px] font-semibold text-foreground tracking-tight ${className}`}>{children}</h2>
);
export const H3 = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <h3 className={`text-[16px] md:text-[18px] font-semibold text-foreground ${className}`}>{children}</h3>
);
export const H4 = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <h4 className={`text-[14px] md:text-[15px] font-semibold text-foreground ${className}`}>{children}</h4>
);
export const BodyLarge = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <p className={`text-[15px] font-normal text-muted-foreground leading-relaxed ${className}`}>{children}</p>
);
export const Body = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <p className={`text-[13.5px] font-normal text-muted-foreground leading-relaxed ${className}`}>{children}</p>
);
export const Small = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <p className={`text-[12px] font-normal text-muted-foreground ${className}`}>{children}</p>
);
export const Caption = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <span className={`text-[11px] font-medium text-muted-foreground uppercase tracking-wider ${className}`}>{children}</span>
);

// ==========================================
// BUTTONS
// ==========================================
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  children, variant = 'primary', size = 'md', className = '', icon: Icon, iconPosition = 'left', isLoading = false, disabled, ...props 
}, ref) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none";
  
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] border border-transparent rounded-[8px] shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98] rounded-[8px]",
    outline: "bg-transparent text-primary border border-primary hover:bg-primary/10 rounded-[8px]",
    ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent rounded-[8px]",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90 active:scale-[0.98] border border-transparent rounded-[8px]",
    icon: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent rounded-full p-[8px]",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "px-[12px] h-[32px] text-[12px] gap-[6px]",
    md: "px-[16px] h-[38px] text-[13px] gap-[8px]",
    lg: "px-[20px] h-[44px] text-[14px] gap-[10px]",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${variant === 'icon' ? '' : sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-[14px] h-[14px] border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} strokeWidth={2} className="shrink-0" />
      )}
      {children}
      {!isLoading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} strokeWidth={2} className="shrink-0" />}
    </button>
  );
});
Button.displayName = 'Button';

// ==========================================
// CARDS & CONTAINERS
// ==========================================
export const Card = ({ children, className = '', onClick, hoverable = false }: { children: React.ReactNode, className?: string, onClick?: () => void, hoverable?: boolean }) => (
  <div 
    className={`bg-card text-card-foreground border border-border rounded-[14px] p-[20px] md:p-[24px] ${hoverable ? 'hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer' : ''} ${className}`} 
    onClick={onClick} 
    role={onClick ? "button" : undefined} 
    tabIndex={onClick ? 0 : undefined} 
    onKeyDown={onClick ? (e) => {if(e.key==='Enter' || e.key === ' ') onClick()} : undefined}
  >
    {children}
  </div>
);

export const SectionCard = ({ title, subtitle, action, children, className = '' }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) => (
  <Card className={className}>
    <div className="flex items-center justify-between pb-[16px] mb-[16px] border-b border-border">
      <div>
        <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-[12px] text-muted-foreground mt-[2px]">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
    {children}
  </Card>
);

// ==========================================
// FORM INPUTS
// ==========================================
export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="flex flex-col gap-[4px] w-full">
        {label && (
          <label htmlFor={inputId} className="text-[12px] font-semibold text-foreground">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full h-[40px] px-[14px] bg-background border ${error ? 'border-destructive' : 'border-border'} rounded-[8px] text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-[11px] font-medium text-destructive flex items-center gap-[4px] mt-[2px]">
            <AlertCircle size={12} /> {error}
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-muted-foreground mt-[2px]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
TextInput.displayName = 'TextInput';

export const PasswordInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const [show, setShow] = React.useState(false);
    return (
      <div className="flex flex-col gap-[4px] w-full relative">
        <TextInput
          ref={ref}
          label={label}
          error={error}
          helperText={helperText}
          type={show ? 'text' : 'password'}
          className={`pr-[40px] ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-[12px] top-[32px] text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="flex flex-col gap-[4px] w-full">
        {label && (
          <label htmlFor={textareaId} className="text-[12px] font-semibold text-foreground">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={`w-full p-[14px] bg-background border ${error ? 'border-destructive' : 'border-border'} rounded-[8px] text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-y min-h-[90px] ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-[11px] font-medium text-destructive flex items-center gap-[4px] mt-[2px]">
            <AlertCircle size={12} /> {error}
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-muted-foreground mt-[2px]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
TextArea.displayName = 'TextArea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="flex flex-col gap-[4px] w-full relative">
        {label && (
          <label htmlFor={selectId} className="text-[12px] font-semibold text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full h-[40px] pl-[14px] pr-[36px] bg-background border ${error ? 'border-destructive' : 'border-border'} rounded-[8px] text-[13.5px] text-foreground focus:outline-none focus:border-primary appearance-none cursor-pointer ${className}`}
            {...props}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';

// ==========================================
// HEADERS & TOOLBARS
// ==========================================
export const PageHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px] mb-[20px]">
    <div>
      <H1>{title}</H1>
      {subtitle && <Body className="mt-[4px]">{subtitle}</Body>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const FilterBar = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-[12px] flex-wrap bg-card border border-border rounded-[12px] p-[12px]">
    {children}
  </div>
);

// ==========================================
// MODALS & DIALOGS
// ==========================================
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-[480px]' }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`relative bg-card border border-border rounded-[16px] p-[24px] w-full ${maxWidth} shadow-2xl z-10`}
        >
          <div className="flex items-center justify-between mb-[16px] pb-[12px] border-b border-border">
            <h3 className="text-[16px] font-semibold text-foreground">{title}</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close modal">
              <X size={16} />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
// ==========================================
// BADGES
// ==========================================
export const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple', className?: string }) => {
  const variants = {
    default: "bg-secondary text-secondary-foreground border border-border",
    success: "bg-[#0ABE52]/10 text-[#0ABE52] border border-[#0ABE52]/20",
    warning: "bg-[#EE8248]/10 text-[#EE8248] border border-[#EE8248]/20",
    danger: "bg-destructive/10 text-destructive border border-destructive/20",
    purple: "bg-[#B57AF1]/10 text-[#B57AF1] border border-[#B57AF1]/20",
  };
  return (
    <span className={`inline-flex items-center px-[8px] py-[2px] rounded-full text-[11px] font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ==========================================
// METRIC CARDS
// ==========================================
export const StatCard = ({ title, value, icon: Icon, trend }: { title: string, value: string | number, icon?: LucideIcon, trend?: React.ReactNode }) => (
  <div className="flex flex-col justify-between p-[24px] border border-border rounded-[14px] bg-card shadow-sm transition-shadow hover:shadow-md group">
    <div className="flex justify-between items-start">
      <div className="text-[14px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</div>
      {Icon && (
        <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center border border-primary/20 bg-primary/10">
          <Icon size={18} strokeWidth={1.8} className="text-primary" />
        </div>
      )}
    </div>
    <div className="flex flex-col gap-[4px] mt-[16px]">
      <div className="text-[28px] font-bold text-foreground leading-none tracking-tight">{value}</div>
      {trend && <div className="text-[12px] text-muted-foreground">{trend}</div>}
    </div>
  </div>
);

export const MetricCard = ({ label, value, icon: Icon, color = 'primary', description }: { label: string, value: string | number, icon: LucideIcon, color?: 'primary' | 'success' | 'warning' | 'purple', description?: string }) => {
  const colorMap = {
    primary: "text-primary bg-primary/10 border-primary/20",
    success: "text-[#0ABE52] bg-[#0ABE52]/10 border-[#0ABE52]/20",
    warning: "text-[#EE8248] bg-[#EE8248]/10 border-[#EE8248]/20",
    purple: "text-[#B57AF1] bg-[#B57AF1]/10 border-[#B57AF1]/20",
  };
  
  return (
    <div className="flex flex-col justify-between p-[20px] border border-border rounded-[14px] bg-card shadow-sm transition-shadow hover:shadow-md group">
      <div className="flex justify-between items-start">
        <div className="text-[14px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</div>
        <div className={`w-[36px] h-[36px] rounded-[10px] flex items-center justify-center border ${colorMap[color]}`}>
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </div>
      <div className="flex flex-col gap-[4px] mt-[12px]">
        <div className="text-[28px] font-bold text-foreground leading-none tracking-tight">{value}</div>
        {description && <div className="text-[11px] text-muted-foreground">{description}</div>}
      </div>
    </div>
  );
};
