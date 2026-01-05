import React from 'react';

interface DrinkAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  hasToppings?: boolean;
}

const DrinkAvatar: React.FC<DrinkAvatarProps> = ({ name, size = 'md', hasToppings = false }) => {
  const getColors = (n: string) => {
    const lower = n.toLowerCase();
    if (lower.includes('奶') || lower.includes('乳') || lower.includes('拿鐵') || lower.includes('歐蕾')) 
      return { liquid: '#F5E6D3', border: '#D2B48C' }; // Milky
    if (lower.includes('紅')) return { liquid: '#8B4513', border: '#5D2E0C' }; // Black Tea
    if (lower.includes('綠') || lower.includes('青') || lower.includes('烏龍')) 
      return { liquid: '#FFD700', border: '#DAA520' }; // Green/Oolong
    if (lower.includes('果') || lower.includes('檸檬') || lower.includes('柚')) 
      return { liquid: '#FF6347', border: '#CD5C5C' }; // Fruit
    return { liquid: '#FBBF24', border: '#B45309' }; // Default Amber
  };

  const { liquid, border } = getColors(name);
  const dimensions = size === 'sm' ? 'w-10 h-12' : size === 'lg' ? 'w-24 h-32' : 'w-16 h-20';

  return (
    <div className={`relative ${dimensions} flex items-end justify-center group`}>
      {/* Cup Body */}
      <div 
        className="w-full h-full bg-slate-800/50 rounded-b-xl rounded-t-sm border-2 border-slate-700 relative overflow-hidden"
        style={{ borderColor: border + '44' }}
      >
        {/* Liquid */}
        <div 
          className="absolute bottom-0 left-0 right-0 rounded-b-lg transition-all duration-700"
          style={{ height: '85%', backgroundColor: liquid }}
        >
          {/* Bubbles/Toppings */}
          {hasToppings && (
            <div className="absolute bottom-1 left-0 right-0 flex flex-wrap justify-center gap-0.5 px-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
              ))}
            </div>
          )}
          {/* Gloss */}
          <div className="absolute top-0 left-1 w-1/4 h-full bg-white/10 skew-x-12"></div>
        </div>
      </div>
      {/* Straw */}
      <div className="absolute -top-3 right-1/4 w-1.5 h-6 bg-slate-600 rounded-full rotate-12 z-0"></div>
    </div>
  );
};

export default DrinkAvatar;