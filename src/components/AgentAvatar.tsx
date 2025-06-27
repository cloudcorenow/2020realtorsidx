import React from 'react';

interface AgentAvatarProps {
  name: string;
  photo?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const AgentAvatar: React.FC<AgentAvatarProps> = ({ 
  name, 
  photo, 
  size = 'md', 
  className = '' 
}) => {
  const getInitials = (fullName: string): string => {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl'
  };

  const gradients = [
    'from-blue-500 to-blue-700',
    'from-amber-500 to-amber-700',
    'from-emerald-500 to-emerald-700',
    'from-purple-500 to-purple-700',
    'from-rose-500 to-rose-700',
    'from-indigo-500 to-indigo-700',
    'from-teal-500 to-teal-700',
    'from-orange-500 to-orange-700'
  ];

  // Generate consistent gradient based on name
  const gradientIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  const gradient = gradients[gradientIndex];

  if (photo && photo !== 'placeholder') {
    return (
      <img
        src={photo}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-lg ${className}`}
        onError={(e) => {
          // Fallback to placeholder if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-semibold shadow-lg border-2 border-white ${className}`}>
      {getInitials(name)}
    </div>
  );
};

export default AgentAvatar;