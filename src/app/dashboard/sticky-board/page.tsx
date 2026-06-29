"use client";

import { useState, useEffect } from "react";
import { StickyNote, Plus, X, Pin, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, writeBatch } from "firebase/firestore";

type Note = {
  id: string;
  content: string;
  color: string;
  x: number;
  y: number;
  pinned: boolean;
};

export default function StickyBoardPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);

  const colors = [
    "var(--memphis-yellow)",
    "var(--memphis-pink)",
    "var(--memphis-mint)",
    "var(--memphis-teal)",
    "var(--memphis-blue)",
  ];

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const notesRef = collection(db, "users", user.uid, "notes");
    
    const unsub = onSnapshot(notesRef, (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
      // Filter out the previously seeded static data
      const mockContents = [
        "Don't forget to push Memphis design updates to prod! 🔥",
        "Idea: Build a Pomodoro integration directly into the Task Node.",
        "Client meeting at 4 PM - prep the slide deck."
      ];
      const realNotes = fetchedNotes.filter(n => !mockContents.includes(n.content));
      setNotes(realNotes);
      setIsLoading(false);
    });

    return () => unsub();
  }, [user]);

  const addNote = async () => {
    if (!user) return;
    const newNote: Note = {
      id: Date.now().toString(),
      content: "New Note",
      color: colors[Math.floor(Math.random() * colors.length)],
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50,
      pinned: false
    };
    await setDoc(doc(db, "users", user.uid, "notes", newNote.id), newNote);
  };

  const updateNote = async (id: string, content: string) => {
    if (!user) return;
    const note = notes.find(n => n.id === id);
    if (note) {
      // Optimistic local update for typing speed
      setNotes(notes.map(n => n.id === id ? { ...n, content } : n));
      await setDoc(doc(db, "users", user.uid, "notes", id), { ...note, content }, { merge: true });
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "notes", id));
  };

  const togglePin = async (id: string) => {
    if (!user) return;
    const note = notes.find(n => n.id === id);
    if (note) {
      await setDoc(doc(db, "users", user.uid, "notes", id), { pinned: !note.pinned }, { merge: true });
    }
  };

  const handleDragEnd = async (id: string, info: any) => {
    if (!user) return;
    const note = notes.find(n => n.id === id);
    if (note) {
      const newX = note.x + info.offset.x;
      const newY = note.y + info.offset.y;
      await setDoc(doc(db, "users", user.uid, "notes", id), { x: newX, y: newY }, { merge: true });
    }
    setDraggedNote(null);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)] text-black relative font-body overflow-hidden">
      <header className="pl-[72px] pr-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 border-b-4 border-black bg-white relative z-10 gap-4 md:gap-0">
        <div className="absolute inset-0 pattern-grid opacity-10 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--memphis-yellow)] border-4 border-black rounded-xl md:rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0">
            <StickyNote className="w-5 h-5 md:w-6 md:h-6 text-black" />
          </div>
          <div>
            <h2 className="text-[20px] md:text-[28px] font-display font-black text-black tracking-tight uppercase leading-none">Sticky Board</h2>
            <p className="text-[11px] md:text-[13px] font-mono font-bold text-gray-500 uppercase tracking-widest mt-1">Brain dump, to-dos, and transient thoughts.</p>
          </div>
        </div>
        <button 
          onClick={addNote}
          className="memphis-btn memphis-btn--pink flex items-center justify-center gap-2 z-10 w-full md:w-auto py-3 md:py-4"
        >
          <Plus className="w-5 h-5" /> New Note
        </button>
      </header>

      {/* Canvas Wrapper */}
      <div className="flex-1 relative overflow-auto bg-[#FDFBF7]" id="board-canvas-wrapper">
        <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none" />
        
        {/* Inner pannable canvas space for mobile */}
        <div className="relative min-w-[1200px] min-h-[1200px] md:min-w-full md:min-h-full">
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                drag
                dragMomentum={false}
                onDragStart={() => setDraggedNote(note.id)}
                onDragEnd={(_, info) => handleDragEnd(note.id, info)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, zIndex: draggedNote === note.id ? 50 : (note.pinned ? 40 : 10) }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  x: note.x,
                  y: note.y,
                  position: 'absolute'
                }}
                className="w-56 min-h-56 md:w-64 md:min-h-64 border-4 border-black p-3 md:p-4 flex flex-col shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-grab active:cursor-grabbing hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                onClick={(e) => e.stopPropagation()}
              >
                <div 
                  className="absolute inset-0 z-[-1]" 
                  style={{ backgroundColor: note.color }} 
                />
                
                <div className="flex justify-between items-start mb-2">
                  <button 
                    onClick={() => togglePin(note.id)}
                    className={`p-2 md:p-1 border-2 border-black rounded ${note.pinned ? 'bg-black text-white' : 'bg-white text-black'} hover:bg-black hover:text-white transition-colors`}
                  >
                    <Pin className="w-4 h-4 md:w-4 md:h-4" />
                  </button>
                  <button 
                    onClick={() => deleteNote(note.id)}
                    className="p-2 md:p-1 border-2 border-transparent hover:border-black rounded bg-white/50 hover:bg-white text-black transition-colors"
                  >
                    <X className="w-4 h-4 md:w-4 md:h-4" />
                  </button>
                </div>

                <textarea
                  value={note.content}
                  onChange={(e) => updateNote(note.id, e.target.value)}
                  className="flex-1 bg-transparent resize-none focus:outline-none font-mono font-bold text-[14px] md:text-[15px] leading-relaxed text-black placeholder:text-black/50"
                  placeholder="Type your note here..."
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
