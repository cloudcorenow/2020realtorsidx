import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantStyles = {
    primary: 'bg-blue-900 text-white hover:bg-blue-800 active:bg-blue-950',
    secondary: 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-900',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-900',
    link: 'bg-transparent underline-offset-4 hover:underline text-blue-900 hover:text-blue-800 p-0 h-auto'
  };
  
  const sizeStyles = {
    sm: 'text-xs h-9 px-3',
    md: 'text-sm h-10 py-2 px-4',
    lg: 'text-base h-12 px-8'
  };
  
  const widthStyle = fullWidth ? 'w-full' : '';
  
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;
  
  return (
    <button className={buttonStyles} {...props}>
      {children}
    </button>
  );
};

export default Button;