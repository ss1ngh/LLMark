import React, { useState, useEffect, useRef } from 'react';
import { Save, Trash2 } from 'lucide-react';

interface BookmarkData {
  id: number;
  title: string;
  y: number;
  color: string;
  url: string;
}

const COLORS = [
  '#FF595E', // Red
  '#FF9F1C', // Orange
  '#FFCA3A', // Yellow
  '#8AC926', // Green
  '#1982C4', // Blue
  '#6A4C93', // Purple
  '#FF006E', // Hot Pink
  '#3A86FF', // Azure Blue
  '#8338EC', // Electric Violet
  '#FB5607', // Tangerine
  '#06D6A0', // Teal/Mint
  '#EF476F', // Rose
  '#118AB2', // Cerulean
  '#073B4C', // Midnight Green
  '#9D4EDD', // Deep Orchid
  '#2EC4B6', // Tiffany Blue
  '#F15BB5', // Bubblegum
  '#9EF01A', // Lime
];

const getVisibleContext = (): string => {
  const selection = window.getSelection()?.toString().trim();
  if (selection && selection.length > 0) return selection;

  const elements = document.querySelectorAll('p, h1, h2, h3, li, div.message-content');
  let bestCandidate = "New Context Point";
  let maxVisibility = 0;

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    if (rect.top > viewportHeight * 0.2 && rect.bottom < viewportHeight * 0.8) {
      const text = (el as HTMLElement).innerText.trim();
      if (text.length > 10 && text.length > maxVisibility) {
        maxVisibility = text.length;
        bestCandidate = text;
      }
    }
  });

  return bestCandidate.substring(0, 50).replace(/\n/g, ' ');
};

const LLMarkApp = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['llmarks'], (result) => {
        const allMarks = (result.llmarks as BookmarkData[]) || [];
        const currentUrl = window.location.href;
        const pageMarks = allMarks.filter((m: BookmarkData) => m.url === currentUrl);
        setBookmarks(pageMarks);
      });
    }
  }, []);

  const syncToStorage = (newBookmarks: BookmarkData[]) => {
    if (typeof chrome === 'undefined' || !chrome.storage) return;

    chrome.storage.local.get(['llmarks'], (result) => {
      const allMarks = (result.llmarks as BookmarkData[]) || [];
      const currentUrl = window.location.href;
      const otherPageMarks = allMarks.filter((m: BookmarkData) => m.url !== currentUrl);
      const updatedStorage = [...otherPageMarks, ...newBookmarks];
      chrome.storage.local.set({ llmarks: updatedStorage });
    });
  };

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const handleCapture = () => {
    const scrollPos = window.scrollY;
    let generatedTitle = getVisibleContext();
    if (generatedTitle.length > 30) generatedTitle = generatedTitle.substring(0, 30) + '...';

    const newId = Date.now();
    const newBookmark: BookmarkData = {
      id: newId,
      title: generatedTitle,
      y: scrollPos,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      url: window.location.href
    };

    const updatedList = [...bookmarks, newBookmark];
    setBookmarks(updatedList);
    syncToStorage(updatedList);
    setEditValue(generatedTitle);
    setEditingId(newId);
  };

  const saveTitle = (id: number) => {
    const updatedList = bookmarks.map(b => b.id === id ? { ...b, title: editValue } : b);
    setBookmarks(updatedList);
    syncToStorage(updatedList);
    setEditingId(null);
  };

  const deleteBookmark = (id: number) => {
    const updatedList = bookmarks.filter(b => b.id !== id);
    setBookmarks(updatedList);

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['llmarks'], (result) => {
        const allMarks = (result.llmarks as BookmarkData[]) || [];
        const remainingMarks = allMarks.filter((b: BookmarkData) => b.id !== id);
        chrome.storage.local.set({ llmarks: remainingMarks });
      });
    }
  };

  const handleScrollTo = (y: number) => {
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter') saveTitle(id);
    if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <div className="font-sans">

      {/* Hide Scrollbar CSS Injection */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* SIDEBAR CONTAINER */}
      <div className="fixed top-0 right-0 h-screen w-auto flex flex-col justify-center items-end z-[9998] pointer-events-none pr-0">

        {/* SCROLLABLE WRAPPER 
            1. max-h-[80vh]: Allows list to grow up to 80% of screen.
            2. overflow-y-auto: Enables scrolling when needed.
            3. pointer-events-auto: Captures mouse wheel.
            4. pl-4 py-4: Adds padding so shadows don't get clipped.
        */}
        <div className="flex flex-col gap-3 items-end w-full max-h-[80vh] overflow-y-auto pointer-events-auto no-scrollbar pl-4 py-4">

          {bookmarks.map((bm) => {
            const isEditing = editingId === bm.id;

            return (
              <div
                key={bm.id}
                onClick={() => !isEditing && handleScrollTo(bm.y)}
                className={`
                  group relative flex items-center justify-end
                  h-8 shrink-0
                  cursor-pointer
                  transition-all duration-300 ease-out ml-auto
                  ${isEditing ? 'w-72' : 'w-8 hover:w-64'} 
                `}
              >
                {/* THE CLEAN WHITE TAB */}
                <div
                  className="
                    absolute top-0 right-0 bottom-0 
                    w-full h-full
                    flex items-center justify-start 
                    pl-3 pr-2
                    
                    /* TEXT: Clean Dark Gray */
                    text-gray-900 font-semibold text-[11px] tracking-wide
                    
                    /* SHAPE */
                    rounded-l-lg
                    overflow-hidden
                    
                    /* BACKGROUND: Solid White */
                    bg-white
                    
                    /* BORDER */
                    border border-gray-200 border-r-0
                    
                    /* SHADOW */
                    shadow-lg
                    hover:bg-gray-50 transition-colors
                  "
                >
                  {/* color indicator */}
                  <div
                    className="shrink-0 w-2 h-2 rounded-full mr-3"
                    style={{ backgroundColor: bm.color }}
                  ></div>

                  {/* CONTENT AREA */}
                  {isEditing ? (
                    <div className="flex items-center w-full gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                      <input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, bm.id)}
                        className="
                          bg-transparent
                          text-gray-900 placeholder-gray-400
                          text-[11px] font-medium
                          border-b border-gray-300
                          focus:border-gray-900 focus:outline-none
                          w-full h-6 px-1
                          transition-all
                        "
                        placeholder="Label..."
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); saveTitle(bm.id); }}
                        className="p-1 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                      >
                        <Save size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 overflow-hidden">
                      <span className="whitespace-nowrap truncate text-[11px] font-semibold tracking-wide text-gray-700">
                        {bm.title}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBookmark(bm.id);
                        }}
                        className="ml-2 p-1 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete Bookmark"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* bookmark create button */}
      <div className="fixed bottom-8 right-8 z-[9999]">
        <button
          onClick={handleCapture}
          className="
            group flex items-center justify-center 
            w-12 h-12 
            bg-white
            rounded-2xl
            shadow-xl
            hover:scale-105 active:scale-95 
            transition-all duration-300
            border border-gray-200
          "
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>

    </div>
  );
};

export default LLMarkApp;