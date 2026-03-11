'use client';

import { useState, useEffect } from 'react';
import { useBookStore } from '@/store/useBookStore';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import BookCard from '@/components/BookCard';
import UploadModal from '@/components/UploadModal';
import BootAnimation from '@/components/BootAnimation';
import Navigation from '@/components/Navigation';

export default function Home() {
  const { books, removeBook, theme } = useBookStore();
  const [showUpload, setShowUpload] = useState(false);
  const [showBoot, setShowBoot] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { getAllBooks, deleteBook, isReady } = useIndexedDB();

  useEffect(() => {
    setIsClient(true);
    const hasPlayed = localStorage.getItem('kindle_animation_played');
    if (hasPlayed) {
      setShowBoot(false);
    }
  }, []);

  useEffect(() => {
    if (isReady) {
      getAllBooks().then(loadedBooks => {
        useBookStore.getState().loadBooks(loadedBooks);
      }).catch(console.error);
    }
  }, [isReady, getAllBooks]);

  const handleBootComplete = () => {
    localStorage.setItem('kindle_animation_played', 'true');
    setShowBoot(false);
  };

  const handleDeleteBook = async (id: string) => {
    await deleteBook(id);
    removeBook(id);
  };

  const recentBook = [...books]
    .filter(b => b.lastRead)
    .sort((a, b) => (b.lastRead || 0) - (a.lastRead || 0))[0];

  return (
    <>
      {showBoot && <BootAnimation onComplete={handleBootComplete} />}
      
      <div 
        className="min-h-screen pb-20 md:pb-20"
        data-theme={theme}
        style={{ backgroundColor: 'var(--kindle-bg)' }}
      >
        <div className="max-w-4xl mx-auto min-h-screen flex flex-col">
          <header className="sticky top-0 h-14 flex items-center justify-between px-4 border-b" 
                  style={{ backgroundColor: 'var(--kindle-bg)', borderColor: 'var(--kindle-gray)', opacity: 0.3 }}>
            <button className="text-xl" style={{ color: 'var(--kindle-text)' }}>☰</button>
            <h1 className="text-lg font-medium" style={{ color: 'var(--kindle-text)' }}>Kindle For U</h1>
            <button className="text-xl" style={{ color: 'var(--kindle-text)' }}>⚙️</button>
          </header>

          <main className="p-4">
            {recentBook && (
              <section className="mb-6 md:mb-8">
                <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--kindle-gray)' }}>
                  📖 Continue Reading
                </h2>
                <div className="max-w-xs">
                  <BookCard book={recentBook} />
                </div>
              </section>
            )}

            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-medium" style={{ color: 'var(--kindle-gray)' }}>
                  📚 My Books
                </h2>
              </div>
              
              {books.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6">
                  {books.map((book) => (
                    <BookCard 
                      key={book.id} 
                      book={book}
                      onDelete={() => handleDeleteBook(book.id)}
                    />
                  ))}
                  <button
                    onClick={() => setShowUpload(true)}
                    className="flex flex-col items-center justify-center aspect-[2/3] rounded-lg border-2 border-dashed"
                    style={{ 
                      borderColor: 'var(--kindle-gray)',
                      opacity: 0.5
                    }}
                  >
                    <span className="text-3xl mb-2">+</span>
                    <span className="text-xs" style={{ color: 'var(--kindle-gray)' }}>Add Book</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📚</div>
                  <p className="mb-4" style={{ color: 'var(--kindle-text)' }}>Your library is empty</p>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="px-6 py-2 rounded-lg text-white"
                    style={{ backgroundColor: 'var(--kindle-border)' }}
                  >
                    Add Your First Book
                  </button>
                </div>
              )}
            </section>
          </main>

          <Navigation />
        </div>
      </div>

      <UploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} />
    </>
  );
}
