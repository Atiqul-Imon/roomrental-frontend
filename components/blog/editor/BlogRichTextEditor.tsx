'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import type { JSONContent } from '@tiptap/core';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  ImageIcon,
  Heading2,
  Heading3,
  Underline as UnderlineIcon,
  Quote,
  Minus,
} from 'lucide-react';
import { api } from '@/lib/api';

const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    // StarterKit v3 includes link & underline; disable so standalone extensions are authoritative
    link: false,
    underline: false,
  }),
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
  }),
  Image.configure({ HTMLAttributes: { loading: 'lazy', decoding: 'async' } }),
  Placeholder.configure({ placeholder: 'Write your article…' }),
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded-lg border p-2 text-sm transition-colors ${
        active
          ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-white'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      {children}
    </button>
  );
}

export interface BlogRichTextEditorProps {
  value: JSONContent;
  onChange: (json: JSONContent) => void;
  disabled?: boolean;
  className?: string;
}

export function BlogRichTextEditor({
  value,
  onChange,
  disabled,
  className = '',
}: BlogRichTextEditorProps) {
  const lastEmitted = useRef<string>('');

  const handleUpdate = useCallback(
    (editor: Editor) => {
      const json = editor.getJSON();
      const serialized = JSON.stringify(json);
      if (serialized === lastEmitted.current) return;
      lastEmitted.current = serialized;
      onChange(json);
    },
    [onChange],
  );

  const editor = useEditor({
    extensions,
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'ProseMirror',
      },
    },
    onUpdate: ({ editor }) => handleUpdate(editor),
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const incoming = JSON.stringify(value);
    const current = JSON.stringify(editor.getJSON());
    if (incoming !== current && incoming !== lastEmitted.current) {
      editor.commands.setContent(value, { emitUpdate: false });
      lastEmitted.current = incoming;
    }
  }, [editor, value]);

  const addImageFromUpload = async () => {
    if (!editor || disabled) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const form = new FormData();
      form.append('image', file);
      try {
        const res = await api.post('/upload/image', form);
        const url = res.data?.data?.url;
        if (url) editor.chain().focus().setImage({ src: url }).run();
      } catch {
        alert('Image upload failed');
      }
    };
    input.click();
  };

  const setLink = () => {
    if (!editor || disabled) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!editor) {
    return (
      <div className={`border border-gray-200 rounded-xl bg-gray-50 h-80 animate-pulse ${className}`} />
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.03] ${className}`}
    >
      <div className="flex flex-wrap gap-1 border-b border-slate-100 bg-slate-50/90 p-2">
        <ToolbarButton
          label="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bold"
          active={editor.isActive('bold')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive('italic')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={editor.isActive('underline')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive('bulletList')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive('orderedList')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          active={editor.isActive('blockquote')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Horizontal rule"
          disabled={disabled}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton label="Link" disabled={disabled} onClick={setLink}>
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton label="Image" disabled={disabled} onClick={addImageFromUpload}>
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
      </div>
      <div className="tiptap-editor max-h-[min(70vh,520px)] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
