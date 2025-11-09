
import React, { useState, useCallback } from 'react';
import { editImageWithGemini } from './services/geminiService';
import Header from './components/Header';
import ImageDisplay from './components/ImageDisplay';
import Spinner from './components/Spinner';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // result is "data:image/jpeg;base64,..."
      // we need to strip the prefix "data:image/jpeg;base64,"
      const base64String = result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

const UploadIcon: React.FC = () => (
    <svg className="w-12 h-12 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
    </svg>
);

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File; url: string } | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setOriginalImage({ file, url: URL.createObjectURL(file) });
      setEditedImageUrl(null);
      setError(null);
    } else {
        setError("Please select a valid image file.");
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if (!originalImage || !prompt) {
        setError("Please upload an image and provide a prompt.");
        return;
    };

    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    try {
      const base64Data = await fileToBase64(originalImage.file);
      const editedBase64 = await editImageWithGemini(base64Data, originalImage.file.type, prompt);
      setEditedImageUrl(`data:${originalImage.file.type};base64,${editedBase64}`);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ImageDisplay title="Original Image">
            {!originalImage ? (
                <div className="relative w-full h-full min-h-[300px] md:min-h-[400px] flex items-center justify-center border-2 border-dashed border-gray-600 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="imageUpload"
                    />
                    <label htmlFor="imageUpload" className="text-center cursor-pointer">
                        <UploadIcon />
                        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span></p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP</p>
                    </label>
                </div>
            ) : (
                <img src={originalImage.url} alt="Original" className="w-full h-full object-contain rounded-xl"/>
            )}
          </ImageDisplay>

          <ImageDisplay title="Edited Image">
            <div className="relative w-full h-full min-h-[300px] md:min-h-[400px] flex items-center justify-center border-2 border-dashed border-gray-600 rounded-xl bg-gray-800">
                {isLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded-xl z-10">
                        <Spinner />
                        <p className="mt-4 text-lg">Generating...</p>
                    </div>
                )}
                {editedImageUrl ? (
                    <img src={editedImageUrl} alt="Edited" className="w-full h-full object-contain rounded-xl"/>
                ) : (
                    <div className="text-gray-500">Your edited image will appear here.</div>
                )}
            </div>
          </ImageDisplay>
        </div>

        <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow-lg">
          <label htmlFor="prompt" className="block text-lg font-medium text-gray-300 mb-2">
            Describe your edit
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g., "Add a retro filter" or "Make the sky look like a galaxy"'
            className="w-full h-24 p-4 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-500"
            disabled={isLoading}
          />
          {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
          <div className="mt-6 text-center">
            <button
              onClick={handleGenerateClick}
              disabled={isLoading || !originalImage || !prompt}
              className="px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:scale-100 flex items-center justify-center mx-auto"
            >
              {isLoading && <Spinner small={true} />}
              <span className={isLoading ? 'ml-2' : ''}>Generate Image</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
