'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Reader from '@/components/Reader';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import { useBookStore } from '@/store/useBookStore';

function ReaderContent() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('id');
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { getBook, isReady } = useIndexedDB();
  const { loadBooks } = useBookStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && isReady && bookId) {
      const loadBookData = async () => {
        setIsLoading(true);
        try {
          const allBooks = await getBook(bookId);
          if (allBooks) {
            useBookStore.getState().loadBooks([allBooks]);
          }
        } catch (e) {
          console.error('Failed to load book:', e);
        }
        setIsLoading(false);
      };
      loadBookData();
    }
  }, [isClient, isReady, bookId, getBook]);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#F4F4F4' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">📖</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#F4F4F4' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">📖</div>
          <div>Loading book...</div>
        </div>
      </div>
    );
  }

  if (!bookId) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#F4F4F4' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <div>Book not found</div>
        </div>
      </div>
    );
  }

  return <Reader bookId={bookId} />;
}

export default function ReaderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#F4F4F4' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">📖</div>
          <div>Loading...</div>
        </div>
      </div>
    }>
      <ReaderContent />
    </Suspense>
  );
}
