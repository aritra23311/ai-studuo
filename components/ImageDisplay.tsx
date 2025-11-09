
import React from 'react';

interface ImageDisplayProps {
  title: string;
  children: React.ReactNode;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col items-center p-4 bg-gray-800/50 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-300">{title}</h2>
      <div className="w-full aspect-square flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ImageDisplay;
