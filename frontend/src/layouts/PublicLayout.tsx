import React from 'react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="public-layout">
      <header>hello</header>
      <main>{children}</main>
      <footer>{/* Footer content */}</footer>
    </div>
  );
};
