import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Sparkles, Loader2 } from 'lucide-react';
import { getCortexResponse } from '../lib/gemini';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [isAiLoading, setIsAiLoading] = useState(false);

  if (!editor) {
    return null;
  }

  const handleAiImprove = async () => {
    const currentText = editor.getText();
    if (!currentText.trim()) return;

    setIsAiLoading(true);
    try {
      const prompt = `Mejora el siguiente texto médico, corrigiendo gramática, dándole un tono más profesional y estructurándolo mejor si es necesario. Devuelve SOLO el texto mejorado en formato HTML (puedes usar <b>, <i>, <ul>, <li>, etc.).\n\nTexto original:\n${currentText}`;
      const response = await getCortexResponse(prompt, 'strict', 'fast');
      
      // Clean up potential markdown code blocks from the response
      const cleanHtml = response.replace(/```html/g, '').replace(/```/g, '').trim();
      
      editor.commands.setContent(cleanHtml);
    } catch (error) {
      console.error("AI Improve Error:", error);
      alert("Error al mejorar el texto con IA.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-white/10 bg-black/50 rounded-t-lg items-center">
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
      
      <div className="flex-1" />
      
      <button
        onClick={handleAiImprove}
        disabled={isAiLoading || editor.isEmpty}
        className="flex items-center gap-2 px-3 py-1.5 rounded bg-barcelo-blue/30 border border-barcelo-blue text-white text-xs font-bold hover:bg-barcelo-blue transition-all disabled:opacity-50"
        title="Mejorar con IA (Rápido)"
      >
        {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-barcelo-gold" />}
        Mejorar con IA
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
