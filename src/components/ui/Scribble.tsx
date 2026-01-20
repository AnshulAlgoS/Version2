import React from 'react';

export const Scribble = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 200 40" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path 
      d="M5 25C30 15 60 5 90 15C120 25 150 35 180 20C190 15 195 10 195 10" 
      stroke="currentColor" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="opacity-90"
    />
    <path 
      d="M10 10C40 25 80 35 120 25C150 15 180 5 190 15" 
      stroke="currentColor" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="opacity-70"
    />
  </svg>
);
