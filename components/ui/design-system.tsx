import React from 'react';
import { LucideIcon } from 'lucide-react';

// ==========================================
// TYPOGRAPHY
// ==========================================
export const H1 = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <h1 className={`text-h1 font-medium text-text-primary ${className}`}>{children}</h1>
);
export const H2 = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <h2 className={`text-h2 font-medium text-text-primary ${className}`}>{children}</h2>
);
export const H3 = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <h3 className={`text-h3 font-medium text-text-primary ${className}`}>{children}</h3>
);
export const H4 = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <h4 className={`text-h4 font-medium text-text-primary ${className}`}>{children}</h4>
);
export const BodyLarge = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <p className={`text-body-lg font-normal text-text-secondary ${className}`}>{children}</p>
);
export const Body = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <p className={`text-body font-normal text-text-secondary ${className}`}>{children}</p>
);
export const Small = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <p className={`text-small font-normal text-text-secondary ${className}`}>{children}</p>
);
export const Caption = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <span className={`text-caption font-normal text-text-secondary ${className}`}>{children}</span>
);

// ==========================================
// BUTTONS
// ==========================================
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  children, variant = 'primary', size = 'md', className = '', icon: Icon, ...props 
}, ref) => {
  const baseStyle = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 border border-transparent rounded-[8px] shadow-none",
    secondary: "bg-white text-text-primary border border-border hover:bg-hover rounded-[8px] shadow-none",
    ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-hover border border-transparent rounded-[8px]",
    icon: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-hover border border-transparent rounded-full",
  };

  const sizes = {
    sm: "px-12 py-8 text-small gap-8",
    md: "px-16 py-12 text-body gap-8",
    lg: "px-24 py-16 text-body-lg gap-12",
  };

  const iconSizes = {
    sm: "p-8",
    md: "p-12",
    lg: "p-16",
  };

  const currentSize = variant === 'icon' ? iconSizes[size] : sizes[size];

  return (
    <button ref={ref} className={`${baseStyle} ${variants[variant]} ${currentSize} ${className}`} {...props}>
      {Icon && <Icon size={20} strokeWidth={1.8} className={children ? "-ml-4" : ""} />}
      {children}
    </button>
  );
});
Button.displayName = 'Button';

// ==========================================
// CARDS
// ==========================================
export const Card = ({ children, className = '', onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div className={`bg-white border border-border rounded-card p-24 md:p-32 ${className}`} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={onClick ? (e) => {if(e.key==='Enter') onClick()} : undefined}>
    {children}
  </div>
);

// ==========================================
// INPUTS
// ==========================================
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full bg-background border border-border rounded-input px-16 py-12 text-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors ${className}`}
    {...props}
  />
));
Input.displayName = 'Input';

// ==========================================
// BADGES
// ==========================================
export const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple', className?: string }) => {
  const variants = {
    default: "bg-gray-100 text-text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
    purple: "bg-purple/10 text-purple",
  };
  return (
    <span className={`inline-flex items-center px-12 py-4 rounded-badge text-caption font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ==========================================
// TABS
// ==========================================
export const Tabs = ({ tabs, activeTab, onChange }: { tabs: string[], activeTab: string, onChange: (t: string) => void }) => (
  <div className="inline-flex items-center gap-4 bg-[#F9FAFB] border border-border p-4 rounded-[8px]">
    {tabs.map(tab => (
      <button
        key={tab}
        onClick={() => onChange(tab)}
        className={`px-16 py-8 text-[13px] font-medium rounded-[6px] transition-all duration-200 ${activeTab === tab ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-hover'}`}
      >
        {tab}
      </button>
    ))}
  </div>
);

// ==========================================
// METRIC / STAT CARDS
// ==========================================
// StatCard — same proportions as MetricCard, kept for backward compat
export const StatCard = ({ title, value, icon: Icon, trend }: { title: string, value: string | number, icon?: LucideIcon, trend?: React.ReactNode }) => {
  return (
    <div className="flex flex-col justify-between p-32 h-[170px] border border-border rounded-[18px] bg-white shadow-sm transition-shadow hover:shadow-md group">
      <div className="flex justify-between items-start">
        <div className="text-[18px] font-medium text-text-secondary group-hover:text-text-primary transition-colors">{title}</div>
        {Icon && (
          <div className="w-48 h-48 rounded-[12px] flex items-center justify-center border border-primary/20 bg-primary/10">
            <Icon size={24} strokeWidth={1.8} className="text-primary" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 mt-auto">
        <div className="text-[46px] font-bold text-text-primary leading-none tracking-tight">{value}</div>
        {trend && <div className="text-[15px] text-text-secondary">{trend}</div>}
      </div>
    </div>
  );
};

export const MetricCard = ({ label, value, icon: Icon, color = 'primary', description }: { label: string, value: string | number, icon: LucideIcon, color?: 'primary' | 'success' | 'warning' | 'purple', description?: string }) => {
  const colorMap = {
    primary: "text-primary bg-primary/10 border-primary/20",
    success: "text-success bg-success/10 border-success/20",
    warning: "text-warning bg-warning/10 border-warning/20",
    purple: "text-purple bg-purple/10 border-purple/20",
  };
  
  return (
    <div className="flex flex-col justify-between p-32 h-[170px] border border-border rounded-[18px] bg-white shadow-sm transition-shadow hover:shadow-md group">
      <div className="flex justify-between items-start">
        <div className="text-[18px] font-medium text-text-secondary group-hover:text-text-primary transition-colors">{label}</div>
        <div className={`w-48 h-48 rounded-[12px] flex items-center justify-center border ${colorMap[color]}`}>
          <Icon size={24} strokeWidth={1.8} />
        </div>
      </div>
      <div className="flex flex-col gap-4 mt-auto">
        <div className="text-[46px] font-bold text-text-primary leading-none tracking-tight">{value}</div>
        {description && <div className="text-[15px] text-text-secondary">{description}</div>}
      </div>
    </div>
  );
};

// ==========================================
// TABLE
// ==========================================
export const Table = ({ headers, children }: { headers: string[], children: React.ReactNode }) => (
  <div className="w-full overflow-x-auto rounded-[12px] border border-border bg-white">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-border bg-[#F9FAFB]">
          {headers.map((h, i) => (
            <th key={i} className="py-16 px-24 text-[13px] uppercase tracking-wider font-medium text-text-secondary">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {children}
      </tbody>
    </table>
  </div>
);

export const TableRow = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <tr className={`hover:bg-gray-50 transition-colors ${className}`}>
    {children}
  </tr>
);

export const TableCell = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <td className={`py-16 px-24 text-[14px] text-text-primary ${className}`}>
    {children}
  </td>
);

// ==========================================
// SECTION HEADER
// ==========================================
export const SectionHeader = ({ title, description, action }: { title: string, description?: string, action?: React.ReactNode }) => (
  <div className="flex items-end justify-between mb-24">
    <div>
      <H3>{title}</H3>
      {description && <Body className="mt-8">{description}</Body>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ==========================================
// TOOLBAR
// ==========================================
export const Toolbar = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-16 px-24 border-b border-border bg-background">
    {children}
  </div>
);

// ==========================================
// SIDEBAR ITEM
// ==========================================
export const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: LucideIcon, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-12 px-16 py-12 rounded-button text-body font-medium transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'}`}
  >
    <Icon size={20} strokeWidth={1.8} />
    {label}
  </button>
);

// ==========================================
// AVATAR
// ==========================================
export const Avatar = ({ initials, src, size = 'md' }: { initials: string, src?: string, size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: "w-32 h-32 text-caption",
    md: "w-40 h-40 text-body font-medium",
    lg: "w-64 h-64 text-h4 font-medium",
  };
  
  return (
    <div className={`${sizes[size]} rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden`}>
      {src ? <img src={src} alt="Avatar" className="w-full h-full object-cover" /> : initials}
    </div>
  );
};

// ==========================================
// PROFILE CARD
// ==========================================
export const ProfileCard = ({ name, role, initials }: { name: string, role: string, initials: string }) => (
  <div className="flex items-center gap-16 p-16 border border-border rounded-card bg-background">
    <Avatar initials={initials} size="md" />
    <div className="flex flex-col">
      <span className="text-body font-medium text-text-primary">{name}</span>
      <span className="text-caption text-text-secondary mt-4">{role}</span>
    </div>
  </div>
);
