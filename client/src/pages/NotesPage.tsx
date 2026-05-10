import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Plus, Trash2, Search, Loader2, Bold, Italic, List } from 'lucide-react';
import type { TripNote } from '../types';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useDebounce } from '../hooks';

function NoteEditor({ onSave, onCancel }: { onSave: (content: string) => void; onCancel: () => void }) {
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: 'Write your note...' })],
    editorProps: { attributes: { class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[120px] p-3 text-sm' } },
  });

  return (
    <div className="card overflow-hidden">
      <div className="flex gap-1 p-2 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg text-sm transition-colors ${editor?.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
          <Bold size={14} />
        </button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg text-sm transition-colors ${editor?.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
          <Italic size={14} />
        </button>
        <button onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg text-sm transition-colors ${editor?.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
          <List size={14} />
        </button>
      </div>
      <EditorContent editor={editor} />
      <div className="flex gap-2 p-3 border-t border-gray-100 dark:border-gray-800">
        <button onClick={() => onSave(editor?.getHTML() || '')} className="btn-primary text-sm py-1.5">Save Note</button>
        <button onClick={onCancel} className="btn-secondary text-sm py-1.5">Cancel</button>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const { id } = useParams<{ id: string }>();
  const [notes, setNotes] = useState<TripNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const load = async () => {
    const params: any = {};
    if (debouncedSearch) params.q = debouncedSearch;
    const { data } = await api.get(`/trips/${id}/notes`, { params });
    setNotes(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id, debouncedSearch]);

  const saveNote = async (content: string) => {
    if (!content || content === '<p></p>') return;
    await api.post(`/trips/${id}/notes`, { content });
    toast.success('Note saved!');
    setAdding(false);
    load();
  };

  const deleteNote = async (noteId: string) => {
    await api.delete(`/trips/${id}/notes/${noteId}`);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trip Journal</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> New Note
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input pl-9" placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Editor */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <NoteEditor onSave={saveNote} onCancel={() => setAdding(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-3">📓</div>
          <p className="text-gray-500 mb-4">No notes yet. Start journaling your trip!</p>
          <button onClick={() => setAdding(true)} className="btn-primary">Write First Note</button>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note, i) => (
            <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card p-4 group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="prose dark:prose-invert max-w-none text-sm line-clamp-4"
                    dangerouslySetInnerHTML={{ __html: note.content }} />
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button onClick={() => deleteNote(note.id)}
                  className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
