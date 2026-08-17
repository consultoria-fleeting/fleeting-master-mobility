import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'accent' | 'warning' | 'success' | 'danger' | 'baixa';
  onClick?: () => void;
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-card text-card-foreground border',
  primary: 'bg-primary text-primary-foreground',
  accent: 'bg-accent text-accent-foreground',
  warning: 'bg-[hsl(var(--media-exposicao))] text-white',
  success: 'bg-[hsl(var(--referencia))] text-black',
  danger: 'bg-[hsl(var(--alta-exposicao))] text-white',
  baixa: 'bg-[hsl(var(--baixa-exposicao))] text-black',
};

export default function StatCard({ title, value, subtitle, icon: Icon, variant = 'default', onClick, className = '' }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg p-5 shadow-sm transition-all hover:shadow-md ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''} ${variantStyles[variant]} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium opacity-80 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-2 rounded-md bg-white/10">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
