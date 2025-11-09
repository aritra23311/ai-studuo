
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg w-full">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
          Gemini Image Editor
        </h1>
        <p className="text-center text-gray-400 mt-1">Edit images with the power of AI</p>
      </div>
    </header>
  );
};

export default Header;
