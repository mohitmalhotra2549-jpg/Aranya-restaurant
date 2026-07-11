import { cn } from '@/utils/cn';
import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface ButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
}

const variants = {
  primary:
    'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 shadow-lg shadow-amber-900/40 hover:shadow-amber-700/50',
  secondary:
    'bg-white/8 border border-white/12 text-white hover:bg-white/12 backdrop-blur-md',
  ghost: 'bg-transparent text-white/80 hover:bg-white/8 hover:text-white',
  danger:
    'bg-rose-500/15 border border-rose-400/30 text-rose-200 hover:bg-rose-500/25',
  gold: 'bg-gradient-to-br from-[#c9a962] via-[#e8d5a3] to-[#b8954a] text-stone-950 shadow-lg shadow-amber-900/30',
};

const sizes = {
  sm: 'h-9 px-4 text-xs tracking-wide rounded-xl',
  md: 'h-11 px-5 text-sm tracking-wide rounded-xl',
  lg: 'h-13 px-7 text-base tracking-wide rounded-2xl',
  icon: 'h-11 w-11 rounded-xl flex items-center justify-center',
};

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none select-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
