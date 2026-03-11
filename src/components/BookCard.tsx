'use client';

import { Book } from '@/store/useBookStore';
import Link from 'next/link';

interface BookCardProps {
  book: Book;
  onDelete?: () => void;
}

export default function BookCard({ book, onDelete }: BookCardProps) {
  const progressPercent = Math.round(book.progress || 0);

  return (
    <Link href={`/reader?id=${book.id}`} className="block group">
      <div className="flex flex-col">
        <div 
          className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2 shadow-md"
          style={{ backgroundColor: 'var(--kindle-gray)', opacity: 0.2 }}
        >
          {book.cover ? (
            <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">📖</span>
            </div>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm"
            >
              ×
            </button>
          )}
        </div>
        <div className="px-1">
          <div 
            className="font-medium text-sm truncate"
            style={{ color: 'var(--kindle-text)' }}
          >
            {book.title}
          </div>
          <div 
            className="text-xs truncate"
            style={{ color: 'var(--kindle-gray)' }}
          >
            {book.author} [{book.fileType}]
          </div>
          {progressPercent > 0 && (
            <div className="mt-1 h-1 rounded-full bg-gray-200 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${progressPercent}%`,
                  backgroundColor: 'var(--kindle-border)'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
