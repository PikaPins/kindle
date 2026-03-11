'use client';

import { useEffect, useState, useCallback } from 'react';

const DB_NAME = 'kindle-reader-db';
const DB_VERSION = 1;
const STORE_NAME = 'books';

interface BookData {
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

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export function useIndexedDB() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    openDB().then(() => setIsReady(true)).catch(console.error);
  }, []);

  const saveBook = useCallback(async (book: BookData) => {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(book);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }, []);

  const getBook = useCallback(async (id: string): Promise<BookData | undefined> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }, []);

  const getAllBooks = useCallback(async (): Promise<BookData[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }, []);

  const deleteBook = useCallback(async (id: string) => {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }, []);

  const updateBookProgress = useCallback(async (id: string, progress: number, chapter?: number) => {
    const book = await getBook(id);
    if (book) {
      book.progress = progress;
      book.currentChapter = chapter;
      book.lastRead = Date.now();
      await saveBook(book);
    }
  }, [getBook, saveBook]);

  return {
    isReady,
    saveBook,
    getBook,
    getAllBooks,
    deleteBook,
    updateBookProgress,
  };
}
