import React, { useState } from 'react';

interface BookmarkData {
  id: number;
  title: string;
  y: number;
  color: string;
}

const COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FF8F33',
  '#33FFF5', '#8F33FF', '#FFD700', '#FF0000', '#00FF00'
];

// Simple SVG for the "Add" button only
const BookmarkIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21L12 17.5L5 21Z" fill={color} stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LLMarkApp = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);

  const handleCapture = () => {
    const scrollPos = window.scrollY;
    let title = "Bookmark";
    const selection = window.getSelection()?.toString().trim();

    if (selection && selection.length > 0) {
      title = selection.length > 20 ? selection.substring(0, 20) + '...' : selection;
    } else {
      title = `Section ${bookmarks.length + 1}`;
    }

    const newBookmark: BookmarkData = {
      id: Date.now(),
      title,
      y: scrollPos,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };

    setBookmarks((prev) => [...prev, newBookmark]);
  };

  const handleScrollTo = (y: number) => {
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <div className="font-sans">

      {/* SIDEBAR CONTAINER 
        - pointer-events-none: Ensures the sidebar itself doesn't block clicks on the page underneath
        - items-end: Forces everything to align to the right
      */}
      <div className="fixed top-0 right-0 h-screen w-24 flex flex-col justify-center items-end z-[9998] pointer-events-none pr-0">

        {/* The Stack of Tabs */}
        <div className="flex flex-col gap-3 w-full items-end">
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              onClick={() => handleScrollTo(bm.y)}
              className="
                group relative flex items-center justify-end
                h-10 cursor-pointer pointer-events-auto
                transition-all duration-300 ease-out
                /* ml-auto is the MAGIC FIX: It forces this element to stick to the right, even if others move */
                ml-auto
                /* Width Transition */
                w-12 hover:w-56
              "
            >
              {/* THE SOLID TAB SHAPE */}
              <div
                className="
                  absolute top-0 right-0 bottom-0 
                  w-full h-full
                  flex items-center justify-start pl-8 pr-4
                  text-white font-bold text-xs shadow-xl
                  whitespace-nowrap overflow-hidden
                "
                style={{
                  backgroundColor: bm.color,
                  /* The Ribbon Shape */
                  clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 20px 100%, 0 50%)'
                }}
              >
                {/* Text: Delays appearance slightly so it doesn't flicker during quick mouse movements */}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
                  {bm.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* THE ADD BUTTON (Bottom Right) */}
      <div className="fixed bottom-10 right-10 z-[9999]">
        <button
          onClick={handleCapture}
          className="
            group flex items-center justify-center 
            w-14 h-14 bg-black rounded-full 
            shadow-2xl hover:scale-110 active:scale-95 
            transition-all duration-300
            border-2 border-gray-800
          "
          title="Bookmark this spot"
        >
          <BookmarkIcon color="white" size={24} />
          <div className="absolute top-3 right-3 w-3 h-3 bg-blue-500 rounded-full border-2 border-black"></div>
        </button>
      </div>

    </div>
  );
};

export default LLMarkApp;