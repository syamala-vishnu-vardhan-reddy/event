import React from 'react';

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 'none', score: 0, color: 'gray' };
    
    let score = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Determine strength level
    let strength = 'weak';
    let color = 'red';
    
    if (score >= 5) {
      strength = 'strong';
      color = 'green';
    } else if (score >= 3) {
      strength = 'medium';
      color = 'yellow';
    }

    return { strength, score, color };
  };

  const { strength, score, color } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              color === 'green' ? 'bg-green-500' : 
              color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${(score / 6) * 100}%` }}
          ></div>
        </div>
        <span className={`text-sm font-medium ${
          color === 'green' ? 'text-green-600' : 
          color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {strength.charAt(0).toUpperCase() + strength.slice(1)}
        </span>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {strength === 'weak' && 'Add uppercase, numbers, and special characters'}
        {strength === 'medium' && 'Add more variety of characters'}
        {strength === 'strong' && 'Great password strength!'}
      </div>
    </div>
  );
} 