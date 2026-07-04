
import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  priority = false,
  ...props 
}) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`transition-opacity duration-300 ${className}`}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      // Helps prevent CLS if aspect ratio classes aren't enough
      style={{ contentVisibility: 'auto' }}
      {...props}
    />
  );
};

export default OptimizedImage;
