'use client';

import { useState, useEffect } from 'react';
import { useBookStore } from '@/store/useBookStore';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import BookCard from '@/components/BookCard';
import UploadModal from '@/components/UploadModal';
import Navigation from '@/components/Navigation';

export default function Library() {
  const { books, removeBook, theme } = useBookStore();
  const [showUpload, setShowUpload] = useState(false);
  const { getAllBooks, deleteBook, isReady } = useIndexedDB();

  useEffect(() => {
    if (isReady) {
      getAllBooks().then(loadedBooks => {
        useBookStore.getState().loadBooks(loadedBooks);
      }).catch(console.error);
    }
  }, [isReady, getAllBooks]);

  const handleDeleteBook = async (id: string) => {
    await deleteBook(id);
    removeBook(id);
  };

  return (
    <div 
      className="min-h-screen pb-20 md:pb-20"
      data-theme={theme}
      style={{ backgroundColor: 'var(--kindle-bg)' }}
    >
      <div className="max-w-4xl mx-auto min-h-screen flex flex-col">
        <header className="sticky top-0 h-14 flex items-center justify-between px-4 border-b" 
                style={{ backgroundColor: 'var(--kindle-bg)', borderColor: 'var(--kindle-gray)', opacity: 0.3 }}>
          <h1 className="text-lg font-medium" style={{ color: 'var(--kindle-text)' }}>Kindle For U</h1>
          <button 
            onClick={() => setShowUpload(true)}
            className="text-xl"
            style={{ color: 'var(--kindle-text)' }}
          >
            +
          </button>
        </header>

        <main className="p-4">
          {books.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6">
              {books.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book}
                  onDelete={() => handleDeleteBook(book.id)}
                />
              ))}
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
        </main>

        <Navigation />
      </div>

      <UploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} />
    </div>
  );
}
