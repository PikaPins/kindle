'use client';

import { useBookStore } from '@/store/useBookStore';
import { motion, AnimatePresence } from 'framer-motion';

interface FontSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const fonts = ['Literata', 'Georgia', 'Times New Roman', 'Arial'];

export default function FontSettings({ isOpen, onClose }: FontSettingsProps) {
  const { 
    theme, setTheme,
    fontFamily, setFontFamily,
    fontSize, setFontSize,
    lineSpacing, setLineSpacing,
    marginSize, setMarginSize
  } = useBookStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 z-40 shadow-lg"
          style={{ backgroundColor: 'var(--kindle-bg)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium" style={{ color: 'var(--kindle-text)' }}>
              Aa Font Settings
            </h3>
            <button onClick={onClose} className="text-2xl" style={{ color: 'var(--kindle-gray)' }}>
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--kindle-gray)' }}>
                <span>Font Size</span>
                <span>{fontSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="28"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--kindle-gray)' }}>
                <span>Font</span>
              </div>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full p-2 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--kindle-bg)',
                  borderColor: 'var(--kindle-gray)',
                  color: 'var(--kindle-text)'
                }}
              >
                {fonts.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--kindle-gray)' }}>
                <span>Line Spacing</span>
              </div>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.1"
                value={lineSpacing}
                onChange={(e) => setLineSpacing(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--kindle-gray)' }}>
                <span>Margins</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={marginSize}
                onChange={(e) => setMarginSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="text-sm mb-2" style={{ color: 'var(--kindle-gray)' }}>
                Theme
              </div>
              <div className="flex gap-4">
                {[
                  { value: 'light', label: 'Light', bg: '#F4F4F4', text: '#1A1A1A' },
                  { value: 'dark', label: 'Dark', bg: '#1A1A1A', text: '#E8E8E8' },
                  { value: 'sepia', label: 'Sepia', bg: '#F4ECD8', text: '#5B4636' },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value as 'light' | 'dark' | 'sepia')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                      theme === t.value ? 'border-blue-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: t.bg }}
                  >
                    <div className="text-sm font-medium" style={{ color: t.text }}>
                      {t.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
