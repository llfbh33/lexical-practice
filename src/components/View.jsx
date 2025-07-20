import React, { useState, useEffect } from 'react';
import { createEditor } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import {
  $getRoot,
  $createParagraphNode, // Example: creating a paragraph node
  $createTextNode,    // Example: creating a text node
  // ... many other core Lexical functions and classes
} from 'lexical';

// For specific nodes like HeadingNode, ListNode, etc., you will find them here:
import {
  ParagraphNode,
  TextNode,
  // ... any other specific nodes you need
} from 'lexical'; // <--- Import them directly from the 'lexical' package
import { Button } from '@mui/material';
import './Editor.css';
import { HeadingNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
import { ListNode, ListItemNode } from '@lexical/list';
import TOCPlugin from './Plugins/TOCPlugin';




// FILE IS NO LONGER NECESSARY, CAN OUTPUT VIEW AND EDIT FROM THE SAME COMPONENT






// This is your example JSON string from the database
const dbEditorStateString = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Hey there how are you doing? ","type":"text","version":1}],"direction":"ltr","format":"left","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"I am doing pretty well and yourself?","type":"text","version":1}],"direction":"ltr","format":"right","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Good indeed, though my ankle is acting up for some reason","type":"text","version":1}],"direction":"ltr","format":"left","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"I hear you man, my back has been sore for days","type":"text","version":1}],"direction":"ltr","format":"right","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Thats rough bro","type":"text","version":1}],"direction":"ltr","format":"left","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`;

export default function View({ editorStateJsonString, setMode }) {
  const [htmlContent, setHtmlContent] = useState('');
  const [liveEditor, setLiveEditor] = useState(null); 

  useEffect(() => {
    if (!editorStateJsonString) {
      return;
    }

    const editorConfig = {
      namespace: 'my-editor-view',
      nodes: [
        ListNode,
        ListItemNode,
        HeadingNode,
        LinkNode,
        //     // Include all node types that could be in your serialized state
        //     // For your example, ParagraphNode and TextNode are essential.
        //     ParagraphNode,
        //     TextNode,
        //     // Add other nodes if your editor uses them (e.g., LinkNode, ImageNode, etc.)
        //     // HeadingNode, QuoteNode, ListNode, ListItemNode, // uncomment if you use these
      ],
      onError: (error) => {
        console.error('Lexical editor error during HTML generation:', error);
      },
    };

    // 1. Create a temporary editor instance
    const editor = createEditor(editorConfig);
    setLiveEditor(editor); // Store the editor instance for potential future use

    // 2. Parse the JSON string into a Lexical EditorState object
    let editorState;
    try {
      const parsedEditorState = JSON.parse(editorStateJsonString);
      editorState = editor.parseEditorState(parsedEditorState);
    } catch (e) {
      console.error("Failed to parse editor state JSON:", e);
      return;
    }

    // 3. Update the editor with the state and generate HTML
    editor.setEditorState(editorState); // Set the state to the editor instance
    editor.update(() => {
      // It's crucial to call $generateHtmlFromNodes within an editor.update() callback
      // because it operates on Lexical's internal state.
      const html = $generateHtmlFromNodes(editor);
      setHtmlContent(html);
    });

  }, [editorStateJsonString]); // Re-run effect if the input JSON string changes

  if (!liveEditor) {
    return <></>
  }

  return (
    <div style={{ padding: '80px' }}>
      <div className='header'>
        <h3>Rendered HTML Content:</h3>
        <Button className='button' variant="contained" color="primary" onClick={() => setMode('editor')}>
          Switch to Edit Mode
        </Button>
      </div>
      <div className='editor-inner'>
        <div className='table-of-contents'>
          <TOCPlugin inputEditor={liveEditor} />
        </div>
        <div className='editor-view-content'>
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      </div>

      <hr />
      <h3>Raw Lexical JSON State (from DB):</h3>
      <pre>{editorStateJsonString}</pre>
    </div>
  );
}
