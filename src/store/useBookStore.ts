'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  progress: number;
  currentChapter?: number;
  lastRead?: number;
  fileData?: string;
  fileType?: 'epub' | 'txt' | 'pdf';
}

interface BookStore {
  books: Book[];
  currentBook: Book | null;
  theme: 'light' | 'dark' | 'sepia';
  fontFamily: string;
  fontSize: number;
  lineSpacing: number;
  marginSize: number;
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
  setCurrentBook: (book: Book | null) => void;
  updateProgress: (id: string, progress: number, chapter?: number) => void;
  setTheme: (theme: 'light' | 'dark' | 'sepia') => void;
  setFontFamily: (font: string) => void;
  setFontSize: (size: number) => void;
  setLineSpacing: (spacing: number) => void;
  setMarginSize: (margin: number) => void;
  loadBooks: (books: Book[]) => void;
}

export const useBookStore = create<BookStore>()(
  persist(
    (set) => ({
      books: [],
      currentBook: null,
      theme: 'light',
      fontFamily: 'Literata',
      fontSize: 18,
      lineSpacing: 1.5,
      marginSize: 20,

      addBook: (book) => set((state) => ({
        books: [...state.books, book]
      })),

      removeBook: (id) => set((state) => ({
        books: state.books.filter(b => b.id !== id),
        currentBook: state.currentBook?.id === id ? null : state.currentBook
      })),

      setCurrentBook: (book) => set({ currentBook: book }),

      updateProgress: (id, progress, chapter) => set((state) => ({
        books: state.books.map(b => 
          b.id === id 
            ? { ...b, progress, currentChapter: chapter, lastRead: Date.now() }
            : b
        ),
        currentBook: state.currentBook?.id === id 
          ? { ...state.currentBook, progress, currentChapter: chapter }
          : state.currentBook
      })),

      setTheme: (theme) => set({ theme }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLineSpacing: (lineSpacing) => set({ lineSpacing }),
      setMarginSize: (marginSize) => set({ marginSize }),

      loadBooks: (books) => set({ books }),
    }),
    {
      name: 'kindle-settings',
      partialize: (state) => ({
        theme: state.theme,
        fontFamily: state.fontFamily,
        fontSize: state.fontSize,
        lineSpacing: state.lineSpacing,
        marginSize: state.marginSize,
      }),
    }
  )
);
