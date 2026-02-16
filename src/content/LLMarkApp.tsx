import React, { useState, useEffect, useRef } from 'react';
import { Save, Trash2 } from 'lucide-react';

interface BookmarkData {
  id: number;
  title: string;
  anchorText: string;
  preText: string;
  postText: string;
  y: number;
  color: string;
  url: string;
}

const COLORS = [
  '#FF595E', '#FF9F1C', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93',
  '#FF006E', '#3A86FF', '#8338EC', '#FB5607', '#06D6A0', '#EF476F',
  '#118AB2', '#073B4C', '#9D4EDD', '#2EC4B6', '#F15BB5', '#9EF01A',
];

// --- 1. ROBUST SCROLL CONTAINER FINDER ---
const getMainScrollContainer = (): HTMLElement | Window => {
  if (window.scrollY > 0) return window;

  const mainTag = document.querySelector('main');
  if (mainTag) {
    const style = window.getComputedStyle(mainTag);
    if (style.overflowY === 'scroll' || style.overflowY === 'auto') {
      return mainTag;
    }
  }

  const allElements = document.querySelectorAll('*');
  let largestScrollable: HTMLElement | null = null;
  let maxArea = 0;

  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i] as HTMLElement;
    if (el.offsetParent === null) continue;

    const style = window.getComputedStyle(el);
    const isScrollable = (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
      (el.scrollHeight > el.clientHeight);

    if (isScrollable) {
      const rect = el.getBoundingClientRect();
      if (rect.height > window.innerHeight * 0.5) {
        const area = rect.width * rect.height;
        if (area > maxArea) {
          maxArea = area;
          largestScrollable = el;
        }
      }
    }
  }

  return largestScrollable || window;
};

// --- 2. IMPROVED CONTEXT FINDER (ChatGPT/Claude Aware) ---
const getAnchorContext = (): { anchor: HTMLElement, pre: string, post: string } | null => {
  const selectors = [
    '.markdown p', '.markdown li', '.markdown h3', '.markdown pre',
    'p', 'h1', 'h2', 'h3', 'li', 'div.message-content', 'code'
  ].join(', ');

  const elements = document.querySelectorAll(selectors);
  let bestCandidate: HTMLElement | null = null;
  let maxVisibility = 0;
  const viewportHeight = window.innerHeight;

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const isVisible = rect.bottom > viewportHeight * 0.3 && rect.top < viewportHeight * 0.7;

    if (isVisible) {
      const htmlEl = el as HTMLElement;
      const textLen = htmlEl.innerText.trim().length;

      if (textLen > 20 && textLen > maxVisibility) {
        maxVisibility = textLen;
        bestCandidate = htmlEl;
      }
    }
  });

  if (bestCandidate) {
    const anchor = bestCandidate as HTMLElement;
    let preText = "";
    let prevNode = anchor.previousElementSibling;
    while (prevNode && (prevNode as HTMLElement).innerText?.trim().length === 0) {
      prevNode = prevNode.previousElementSibling;
    }
    if (prevNode) preText = (prevNode as HTMLElement).innerText;

    let postText = "";
    let nextNode = anchor.nextElementSibling;
    while (nextNode && (nextNode as HTMLElement).innerText?.trim().length === 0) {
      nextNode = nextNode.nextElementSibling;
    }
    if (nextNode) postText = (nextNode as HTMLElement).innerText;

    return {
      anchor: anchor,
      pre: preText.substring(0, 200).trim(),
      post: postText.substring(0, 200).trim()
    };
  }

  return null;
};

const LLMarkApp = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Function to load bookmarks for the CURRENT URL
  const loadCurrentBookmarks = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['llmarks'], (result) => {
        const allMarks = (result.llmarks as BookmarkData[]) || [];
        const currentUrl = window.location.href;
        const pageMarks = allMarks.filter((m: BookmarkData) => m.url === currentUrl);
        setBookmarks(pageMarks);
      });
    }
  };

  // --- NEW: URL OBSERVER ---
  useEffect(() => {
    // Initial load
    loadCurrentBookmarks();

    // Listen for URL changes in SPAs
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        setEditingId(null); // Close any open editor
        loadCurrentBookmarks();
      }
    });

    observer.observe(document, { subtree: true, childList: true });

    return () => observer.disconnect();
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
    const container = getMainScrollContainer();
    const scrollPos = container instanceof Window
      ? container.scrollY
      : (container as HTMLElement).scrollTop;

    const contextData = getAnchorContext();

    let anchorText = "";
    let preText = "";
    let postText = "";
    let displayTitle = "Bookmark";

    if (contextData) {
      anchorText = contextData.anchor.innerText.trim();
      preText = contextData.pre;
      postText = contextData.post;
      displayTitle = anchorText.substring(0, 50).replace(/\n/g, ' ');
    } else {
      const selection = window.getSelection()?.toString().trim();
      if (selection) {
        anchorText = selection;
        displayTitle = selection;
      } else {
        displayTitle = `Position ${Math.round(scrollPos)}`;
      }
    }

    if (displayTitle.length > 30) displayTitle = displayTitle.substring(0, 30) + '...';

    const newId = Date.now();
    const newBookmark: BookmarkData = {
      id: newId,
      title: displayTitle,
      anchorText: anchorText,
      preText: preText,
      postText: postText,
      y: scrollPos,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      url: window.location.href
    };

    const updatedList = [...bookmarks, newBookmark];
    setBookmarks(updatedList);
    syncToStorage(updatedList);
    setEditValue(displayTitle);
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

  const handleScrollTo = (bm: BookmarkData) => {
    if (bm.anchorText) {
      const selectors = [
        '.markdown p', '.markdown li', '.markdown h3', '.markdown pre',
        'p', 'h1', 'h2', 'h3', 'li', 'div.message-content', 'code'
      ].join(', ');

      const candidates = document.querySelectorAll(selectors);
      let bestMatch: HTMLElement | null = null;
      let highestScore = 0;

      candidates.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const text = htmlEl.innerText || "";

        if (text.includes(bm.anchorText.substring(0, 80))) {
          let score = 1;
          let surroundingText = "";
          if (htmlEl.previousElementSibling) surroundingText += (htmlEl.previousElementSibling as HTMLElement).innerText;
          if (htmlEl.parentElement?.previousElementSibling) surroundingText += (htmlEl.parentElement.previousElementSibling as HTMLElement).innerText;
          surroundingText += text;
          if (htmlEl.nextElementSibling) surroundingText += (htmlEl.nextElementSibling as HTMLElement).innerText;
          if (htmlEl.parentElement?.nextElementSibling) surroundingText += (htmlEl.parentElement.nextElementSibling as HTMLElement).innerText;

          if (bm.preText && surroundingText.includes(bm.preText.substring(0, 40))) score += 2;
          if (bm.postText && surroundingText.includes(bm.postText.substring(0, 40))) score += 2;

          if (score > highestScore) {
            highestScore = score;
            bestMatch = htmlEl;
          }
        }
      });

      if (bestMatch) {
        (bestMatch as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        const el = bestMatch as HTMLElement;
        const originalTrans = el.style.transition;
        const originalBg = el.style.backgroundColor;
        el.style.transition = "background-color 0.5s ease";
        el.style.backgroundColor = "rgba(255, 230, 0, 0.3)";
        setTimeout(() => {
          el.style.backgroundColor = originalBg;
          setTimeout(() => { el.style.transition = originalTrans; }, 500);
        }, 1500);
        return;
      }
    }

    const container = getMainScrollContainer();
    container.scrollTo({ top: bm.y, behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: number) => {
    e.stopPropagation();
    if (e.key === 'Enter') saveTitle(id);
    if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <div className="font-sans">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="fixed top-0 right-0 h-screen w-auto flex flex-col justify-center items-end z-[9998] pointer-events-none pr-0">
        <div className="flex flex-col gap-3 items-end w-full max-h-[80vh] overflow-y-auto pointer-events-auto no-scrollbar pl-4 py-4">
          {bookmarks.map((bm) => {
            const isEditing = editingId === bm.id;

            return (
              <div
                key={bm.id}
                onClick={() => !isEditing && handleScrollTo(bm)}
                className={`
                  group relative flex items-center justify-end
                  h-8 shrink-0
                  cursor-pointer
                  transition-all duration-300 ease-out ml-auto
                  ${isEditing ? 'w-72' : 'w-8 hover:w-64'} 
                `}
              >
                <div
                  className="
                    absolute top-0 right-0 bottom-0 
                    w-full h-full
                    flex items-center justify-start 
                    pl-3 pr-2
                    text-gray-900 font-semibold text-[11px] tracking-wide
                    rounded-l-lg overflow-hidden bg-white
                    border border-gray-200 border-r-0
                    shadow-lg hover:bg-gray-50 transition-colors
                  "
                >
                  <div
                    className="shrink-0 w-2 h-2 rounded-full mr-3"
                    style={{ backgroundColor: bm.color }}
                  ></div>

                  {isEditing ? (
                    <div className="flex items-center w-full gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                      <input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, bm.id)}
                        onKeyUp={(e) => e.stopPropagation()}
                        onKeyPress={(e) => e.stopPropagation()}
                        className="bg-transparent text-gray-900 placeholder-gray-400 text-[11px] font-medium border-b border-gray-300 focus:border-gray-900 focus:outline-none w-full h-6 px-1 transition-all"
                        placeholder="Label..."
                      />
                      <button onClick={(e) => { e.stopPropagation(); saveTitle(bm.id); }} className="p-1 hover:bg-gray-200 rounded text-gray-700 transition-colors"><Save size={12} /></button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 overflow-hidden">
                      <span className="whitespace-nowrap truncate text-[11px] font-semibold tracking-wide text-gray-700">{bm.title}</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteBookmark(bm.id); }} className="ml-2 p-1 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="fixed bottom-8 right-8 z-[9999]">
        <button onClick={handleCapture} className="group flex items-center justify-center w-12 h-12 bg-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 border border-gray-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default LLMarkApp;