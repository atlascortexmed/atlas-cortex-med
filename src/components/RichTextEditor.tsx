import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-white/10 bg-black/50 rounded-t-lg">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded transition-all ${editor.isActive('bold') ? 'bg-barcelo-gold text-barcelo-blue' : 'text-text-mut hover:bg-white/10 hover:text-white'}`}
        title="Negrita"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded transition-all ${editor.isActive('italic') ? 'bg-barcelo-gold text-barcelo-blue' : 'text-text-mut hover:bg-white/10 hover:text-white'}`}
        title="Cursiva"
      >
        <Italic size={16} />
      </button>
      <div className="w-px h-6 bg-white/10 mx-1 self-center" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded transition-all ${editor.isActive('bulletList') ? 'bg-barcelo-gold text-barcelo-blue' : 'text-text-mut hover:bg-white/10 hover:text-white'}`}
        title="Lista con viñetas"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded transition-all ${editor.isActive('orderedList') ? 'bg-barcelo-gold text-barcelo-blue' : 'text-text-mut hover:bg-white/10 hover:text-white'}`}
        title="Lista numerada"
      >
        <ListOrdered size={16} />
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[300px] p-4 outline-none focus:ring-0',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="w-full bg-black/40 border border-white/10 rounded-lg focus-within:border-barcelo-gold transition-colors flex flex-col">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
