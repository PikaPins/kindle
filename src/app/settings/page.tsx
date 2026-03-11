'use client';

import { useBookStore } from '@/store/useBookStore';
import Navigation from '@/components/Navigation';

export default function Settings() {
  const { 
    theme, setTheme,
    fontFamily, setFontFamily,
    fontSize, setFontSize,
    books
  } = useBookStore();

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'sepia', label: 'Sepia' },
  ];

  const fonts = ['Literata', 'Georgia', 'Times New Roman', 'Arial'];

  return (
    <div 
      className="min-h-screen pb-20 md:pb-20"
      data-theme={theme}
      style={{ backgroundColor: 'var(--kindle-bg)' }}
    >
      <div className="max-w-4xl mx-auto min-h-screen flex flex-col">
        <header className="sticky top-0 h-14 flex items-center px-4 border-b" 
                style={{ backgroundColor: 'var(--kindle-bg)', borderColor: 'var(--kindle-gray)', opacity: 0.3 }}>
          <h1 className="text-lg font-medium" style={{ color: 'var(--kindle-text)' }}>Settings</h1>
        </header>

        <main className="p-4">
          <section className="mb-6">
            <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--kindle-gray)' }}>
              Reading Preferences
            </h2>
            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--kindle-bg)', border: '1px solid var(--kindle-gray)' }}>
              <div className="flex justify-between items-center p-3 border-b" style={{ borderColor: 'var(--kindle-gray)' }}>
                <span style={{ color: 'var(--kindle-text)' }}>Default Theme</span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'sepia')}
                  className="p-2 rounded"
                  style={{ backgroundColor: 'var(--kindle-bg)', color: 'var(--kindle-text)' }}
                >
                  {themes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between items-center p-3 border-b" style={{ borderColor: 'var(--kindle-gray)' }}>
                <span style={{ color: 'var(--kindle-text)' }}>Default Font</span>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="p-2 rounded"
                  style={{ backgroundColor: 'var(--kindle-bg)', color: 'var(--kindle-text)' }}
                >
                  {fonts.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between items-center p-3" style={{ borderColor: 'var(--kindle-gray)' }}>
                <span style={{ color: 'var(--kindle-text)' }}>Default Font Size</span>
                <span style={{ color: 'var(--kindle-text)' }}>{fontSize}px</span>
              </div>
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--kindle-gray)' }}>
              Storage
            </h2>
            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--kindle-bg)', border: '1px solid var(--kindle-gray)' }}>
              <div className="flex justify-between items-center p-3 border-b" style={{ borderColor: 'var(--kindle-gray)' }}>
                <span style={{ color: 'var(--kindle-text)' }}>Books in Library</span>
                <span style={{ color: 'var(--kindle-text)' }}>{books.length}</span>
              </div>
              <button 
                onClick={clearAllData}
                className="w-full text-left p-3 text-red-500 hover:bg-red-50 transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--kindle-gray)' }}>
              About
            </h2>
            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--kindle-bg)', border: '1px solid var(--kindle-gray)' }}>
              <div className="flex justify-between items-center p-3" style={{ borderColor: 'var(--kindle-gray)' }}>
                <span style={{ color: 'var(--kindle-text)' }}>Version</span>
                <span style={{ color: 'var(--kindle-text)' }}>1.0.0</span>
              </div>
            </div>
          </section>
        </main>

        <Navigation />
      </div>
    </div>
  );
}
