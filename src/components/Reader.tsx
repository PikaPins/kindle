'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useBookStore } from '@/store/useBookStore';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import FontSettings from './FontSettings';

interface ReaderProps {
  bookId: string;
}

export default function Reader({ bookId }: ReaderProps) {
  const { books, updateProgress, theme, fontFamily, fontSize, lineSpacing, marginSize } = useBookStore();
  const { updateBookProgress, isReady } = useIndexedDB();
  const book = books.find((b) => b.id === bookId);
  
  const [content, setContent] = useState<any>(null);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const prevProgressRef = useRef<number>(0);
  const epubBookRef = useRef<any>(null);
  const epubRenditionRef = useRef<any>(null);
  const pdfDocRef = useRef<any>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const decodeBase64 = useCallback((base64: string): ArrayBuffer => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }, []);

  const loadEpub = useCallback(async (base64Data: string) => {
    try {
      setIsLoading(true);
      setError('');
      const epubjs = await import('epubjs') as any;
      const bookData = decodeBase64(base64Data);
      const book = new epubjs.default(bookData);
      await book.ready;
      epubBookRef.current = book;
      
      const Spine = book.spine;
      setTotalPages(Spine.length);
      setContent({ type: 'epub', book, epubjs });
      setIsLoading(false);
    } catch (err) {
      console.error('EPUB load error:', err);
      setError('Failed to load EPUB');
      setIsLoading(false);
    }
  }, [decodeBase64]);

  const loadPdf = useCallback(async (base64Data: string) => {
    try {
      setIsLoading(true);
      setError('');
      const pdfjsLib = await import('pdfjs-dist') as any;
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      
      const pdfData = decodeBase64(base64Data);
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      pdfDocRef.current = pdf;
      setTotalPages(pdf.numPages);
      setContent({ type: 'pdf', pdf });
      setIsLoading(false);
    } catch (err) {
      console.error('PDF load error:', err);
      setError('Failed to load PDF');
      setIsLoading(false);
    }
  }, [decodeBase64]);

  useEffect(() => {
    if (!book?.fileData) return;

    if (book.fileType === 'txt') {
      const decodeBase64Txt = (base64: string): string => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
      };
      const text = decodeBase64Txt(book.fileData);
      const pages = text.match(/.{1,1500}/g) || [text];
      setTotalPages(pages.length);
      setContent({ type: 'txt', pages, text });
    } else if (book.fileType === 'epub') {
      loadEpub(book.fileData);
    } else if (book.fileType === 'pdf') {
      loadPdf(book.fileData);
    }
  }, [book, loadEpub, loadPdf]);

  useEffect(() => {
    if (content?.type === 'epub' && currentPage > 0 && epubBookRef.current && contentRef.current) {
      const renderPage = async () => {
        try {
          const { book, epubjs } = content as any;
          setIsLoading(true);
          
          if (epubRenditionRef.current) {
            epubRenditionRef.current.destroy();
          }
          
          if (!contentRef.current) return;
          contentRef.current.innerHTML = '';
          
          const rendition = book.renderTo(contentRef.current, {
            width: '100%',
            height: '100%',
            spread: 'none'
          });
          
          epubRenditionRef.current = rendition;
          
          await rendition.display(currentPage - 1);
          setIsLoading(false);
        } catch (err) {
          console.error('EPUB render error:', err);
          setIsLoading(false);
        }
      };
      renderPage();
      
      return () => {
        if (epubRenditionRef.current) {
          epubRenditionRef.current.destroy();
          epubRenditionRef.current = null;
        }
      };
    }
  }, [content, currentPage]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (content?.type === 'pdf' && pdfDocRef.current && currentPage > 0) {
      const renderPage = async () => {
        try {
          const page = await pdfDocRef.current.getPage(currentPage);
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (contentRef.current) {
            contentRef.current.innerHTML = '';
            contentRef.current.appendChild(canvas);
            
          if (!contentRef.current) return;
            const containerWidth = contentRef.current?.clientWidth || 800;
            const baseScale = isMobile ? 1 : 1.8;
            const scale = isMobile 
              ? (containerWidth - 20) / page.getViewport({ scale: 1 }).width 
              : baseScale;
            const viewport = page.getViewport({ scale });
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.style.maxWidth = '100%';
            canvas.style.height = 'auto';
            
            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise;
          }
        } catch (err) {
          console.error('PDF render error:', err);
        }
      };
      renderPage();
    }
  }, [content, currentPage, isMobile]);

  useEffect(() => {
    if (book && progress !== prevProgressRef.current) {
      prevProgressRef.current = progress;
      updateProgress(bookId, progress);
      if (isReady) {
        updateBookProgress(bookId, progress);
      }
    }
  }, [progress, bookId, book, updateProgress, isReady, updateBookProgress]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setProgress(((currentPage - 1) / totalPages) * 100);
    }
  }, [currentPage, totalPages]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setProgress(((currentPage + 1) / totalPages) * 100);
    }
  }, [currentPage, totalPages]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    if (x < width * 0.33) {
      handlePrevPage();
    } else if (x > width * 0.66) {
      handleNextPage();
    } else {
      setShowToolbar(!showToolbar);
    }
  };

  if (!book) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--kindle-bg)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <div style={{ color: 'var(--kindle-text)' }}>Book not found</div>
          <Link href="/" className="mt-4 inline-block" style={{ color: 'var(--kindle-border)' }}>
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-4xl mb-4">📖</div>
            <div style={{ color: 'var(--kindle-text)' }}>Loading...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center" style={{ color: '#dc2626' }}>
            <div className="text-4xl mb-4">❌</div>
            <div>{error}</div>
          </div>
        </div>
      );
    }

    if (content?.type === 'txt') {
      const pages = content.pages || [];
      return (
        <div 
          className="font-serif"
          style={{ 
            fontFamily,
            fontSize: `${fontSize}px`,
            lineHeight: lineSpacing,
            color: 'var(--kindle-text)',
            maxWidth: '800px',
            margin: '0 auto',
            whiteSpace: 'pre-wrap',
          }}
        >
          {pages[currentPage - 1] || ''}
        </div>
      );
    }

    if (content?.type === 'epub') {
      return (
        <div 
          ref={contentRef}
          className="epub-content"
          style={{ 
            color: 'var(--kindle-text)',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        />
      );
    }

    if (content?.type === 'pdf') {
      return (
        <div 
          ref={contentRef}
          className={`pdf-content flex justify-center ${isMobile ? '' : 'pc-view'}`}
          style={{ 
            maxWidth: isMobile ? '100%' : '900px',
            margin: '0 auto',
            width: '100%',
          }}
        />
      );
    }

    return (
      <div style={{ color: 'var(--kindle-text)' }}>
        Loading content...
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: 'var(--kindle-bg)' }}
      data-theme={theme}
      onClick={handleTap}
    >
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-20"
            style={{ backgroundColor: 'var(--kindle-bg)', borderBottom: '1px solid var(--kindle-gray)' }}
          >
            <Link href="/" className="text-2xl" style={{ color: 'var(--kindle-text)' }}>
              ←
            </Link>
            <span className="text-sm font-medium truncate flex-1 text-center px-4" style={{ color: 'var(--kindle-text)' }}>
              {book.title} ({currentPage}/{totalPages})
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
              className="text-xl"
              style={{ color: 'var(--kindle-text)' }}
            >
              •••
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="absolute inset-0 overflow-y-auto"
        style={{ 
          paddingTop: showToolbar ? '60px' : '20px',
          paddingBottom: '40px',
          paddingLeft: `${marginSize}px`,
          paddingRight: `${marginSize}px`,
        }}
      >
        {renderContent()}
      </div>

      <div 
        className="fixed bottom-0 left-0 right-0 h-10 flex items-center px-4"
        style={{ backgroundColor: 'var(--kindle-bg)' }}
      >
        <div className="flex-1 h-1 rounded-full mr-3" style={{ backgroundColor: 'var(--kindle-gray)', opacity: 0.3 }}>
          <div 
            className="h-full rounded-full"
            style={{ 
              width: `${progress}%`,
              backgroundColor: 'var(--kindle-border)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
        <span className="text-xs" style={{ color: 'var(--kindle-gray)', minWidth: '45px', textAlign: 'right' }}>
          {Math.round(progress)}%
        </span>
      </div>

      <FontSettings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      {!isMobile && (content?.type === 'pdf' || content?.type === 'epub') && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); handlePrevPage(); }}
            disabled={currentPage <= 1}
            className="fixed left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center z-10 disabled:opacity-20 transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'var(--kindle-border)', color: 'var(--kindle-bg)' }}
          >
            <span className="text-2xl">‹</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleNextPage(); }}
            disabled={currentPage >= totalPages}
            className="fixed right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center z-10 disabled:opacity-20 transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'var(--kindle-border)', color: 'var(--kindle-bg)' }}
          >
            <span className="text-2xl">›</span>
          </button>
        </>
      )}

      {isMobile && (content?.type === 'pdf' || content?.type === 'epub') && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); handlePrevPage(); }}
            disabled={currentPage <= 1}
            className="fixed left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10 disabled:opacity-30"
            style={{ backgroundColor: 'var(--kindle-border)', color: 'var(--kindle-bg)' }}
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleNextPage(); }}
            disabled={currentPage >= totalPages}
            className="fixed right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10 disabled:opacity-30"
            style={{ backgroundColor: 'var(--kindle-border)', color: 'var(--kindle-bg)' }}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
