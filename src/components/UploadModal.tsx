'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookStore, Book } from '@/store/useBookStore';
import { useIndexedDB } from '@/hooks/useIndexedDB';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { saveBook, getAllBooks, isReady } = useIndexedDB();
  const { addBook, loadBooks } = useBookStore();

  useEffect(() => {
    if (isReady) {
      getAllBooks().then(books => {
        loadBooks(books);
      }).catch(console.error);
    }
  }, [isReady, getAllBooks, loadBooks]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError('');

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!['epub', 'txt', 'pdf'].includes(extension || '')) {
        throw new Error('Unsupported file format. Please use EPUB, TXT, or PDF.');
      }

      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      let cover: string | undefined;
      let title = file.name.replace(/\.[^/.]+$/, '');
      let author = 'Unknown Author';

      if (extension === 'epub') {
        try {
          const epubjs = await import('epubjs') as any;
          const book = new epubjs.default(arrayBuffer);
          await book.ready;
          
          const metadata = await book.loaded.metadata;
          if (metadata.title) title = metadata.title;
          if (metadata.creator) author = metadata.creator;
          
          const coverMeta = await book.cover;
          if (coverMeta) {
            const coverUrl = await book.archive.createUrl(coverMeta);
            const coverResponse = await fetch(coverUrl);
            const coverBlob = await coverResponse.blob();
            cover = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(coverBlob);
            });
          }
        } catch (e) {
          console.error('EPUB cover extraction failed:', e);
        }
      } else if (extension === 'pdf') {
        try {
          const pdfjsLib = await import('pdfjs-dist') as any;
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
          
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const page = await pdf.getPage(1);
          
          const canvas = document.createElement('canvas');
          const viewport = page.getViewport({ scale: 0.5 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({
            canvasContext: canvas.getContext('2d')!,
            viewport: viewport
          }).promise;
          
          cover = canvas.toDataURL('image/jpeg', 0.8);
          
          const info = await pdf.getMetadata();
          if (info.info.Title) title = info.info.Title;
        } catch (e) {
          console.error('PDF cover extraction failed:', e);
        }
      }

      const book: Book = {
        id: Date.now().toString(),
        title,
        author,
        cover,
        progress: 0,
        lastRead: Date.now(),
        fileData: base64,
        fileType: extension as 'epub' | 'txt' | 'pdf',
      };

      await saveBook(book);
      addBook(book);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-8 w-full max-w-md text-center"
            style={{ backgroundColor: 'var(--kindle-bg)' }}
          >
            {isLoading ? (
              <div className="py-12">
                <div className="text-4xl mb-4">📥</div>
                <div className="text-lg font-medium mb-2" style={{ color: 'var(--kindle-text)' }}>
                  Processing...
                </div>
                <div className="text-sm" style={{ color: 'var(--kindle-gray)' }}>
                  Saving to IndexedDB
                </div>
              </div>
            ) : error ? (
              <div className="py-8">
                <div className="text-4xl mb-4">❌</div>
                <div className="text-lg font-medium mb-2" style={{ color: '#dc2626' }}>
                  {error}
                </div>
                <button
                  onClick={() => setError('')}
                  className="mt-4 px-6 py-2 rounded-lg text-white"
                  style={{ backgroundColor: 'var(--kindle-border)' }}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 mb-6 cursor-pointer transition-colors ${
                    isDragging ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  style={{ 
                    borderColor: isDragging ? '#3b82f6' : 'var(--kindle-gray)',
                    opacity: 0.7
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".epub,.txt,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="text-4xl mb-3">📁</div>
                  <div className="font-medium mb-1" style={{ color: 'var(--kindle-text)' }}>
                    Drop file here
                  </div>
                  <div className="text-sm" style={{ color: 'var(--kindle-gray)' }}>
                    or click to browse
                  </div>
                </div>

                <div className="text-sm" style={{ color: 'var(--kindle-gray)' }}>
                  Supported: EPUB, TXT, PDF
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
