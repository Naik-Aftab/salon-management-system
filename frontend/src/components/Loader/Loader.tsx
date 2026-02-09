import React from 'react';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
}

export const Loader: React.FC<LoaderProps> = ({ size = 'medium' }) => {
  return <div className={`loader loader-${size}`}></div>;
};
