// src/plugins/EditorEditableControlPlugin.jsx
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

/**
 * A plugin that controls the editor's overall editability based on a prop.
 */
export default function EditorEditableControlPlugin({ isEditable }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Only update if the editor exists and the editable state is different
    // Lexical's setEditable handles internal state efficiently.
    if (editor && editor.isEditable() !== isEditable) {
      editor.setEditable(isEditable);
    }
  }, [editor, isEditable]); // Re-run effect if editor instance or isEditable prop changes

  return null; // This plugin doesn't render any UI
}