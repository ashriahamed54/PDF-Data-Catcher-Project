
import React from 'react';

const PageBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/10 to-transparent" />
      
      {/* Animated blobs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" 
           style={{ animationDuration: '15s' }} />
      <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"
           style={{ animationDuration: '20s' }} />
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
           style={{ animationDuration: '25s' }} />
      
      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/10 to-transparent" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5 mix-blend-overlay"
           style={{ 
             backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h20v20H0z" fill="%23000" fill-opacity=".05"/%3E%3C/svg%3E")',
             backgroundSize: '20px 20px' 
           }} />
    </div>
  );
};

export default PageBackground;
