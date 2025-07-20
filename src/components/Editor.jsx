import { $getRoot, $getSelection } from 'lexical';
import { useEffect, useState } from 'react';

import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import ToolbarPlugin from './Plugins/ToolBarPlugin';
import TreeViewPlugin from './Plugins/TreeViewPlugin';
import HotkeyPlugin from './Plugins/HotKeyPlugin';
import OnChangePlugin from './Plugins/OnChangePlugin';
import './Editor.css';
import { Button, Grid, Link, Tab } from '@mui/material';
import { LinkPlugin as ReactLinkPlugin } from '@lexical/react/LexicalLinkPlugin'; // <--- IMPORT THIS, aliased to avoid name collision
import { ListPlugin as ReactListPlugin } from '@lexical/react/LexicalListPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TableOfContentsPlugin as ReactTableOfContentsPlugin } from '@lexical/react/LexicalTableOfContentsPlugin';
import TOCPlugin from './Plugins/TOCPlugin';
import EditorEditableControlPlugin from './Plugins/EditorEditableControlPlugin';



// Doesn't render underlined or strikethrough text by default unless you explicitly handle it in 
// the theme or custom node rendering. - May run into this in other locations
const theme = {
    text: {
        underline: 'text-underline',
        strikethrough: 'text-strikethrough',
    },
    // --- ADD THESE LIST-RELATED CLASSES ---
    list: {
        listitem: 'editor-listitem',
        nested: {
            listitem: 'editor-nested-listitem', // For nested items, if you want different styles
        },
        ul: 'editor-list-ul', // Class for the <ul> container
        ol: 'editor-list-ol', // Class for the <ol> container
        // Classes for Checklists - ESSENTIAL for visual functionality
        listitemChecked: 'editor-listitem-checked',
        listitemUnchecked: 'editor-listitem-unchecked',
    },
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
    console.error(error);
}

// Consolidation the initial configuration for the Lexical editor
function Editor({ editorState, setEditorState, isEditable, setIsEditable }) {
    if (!isEditable) {
        isEditable = false; // Ensure isEditable is false if not provided
    }

    // IMPORTANT: Prepare the initial editor state for LexicalComposer
    // This needs to be a Lexical EditorState object or a function that returns one.
    // Since your `editorState` prop is a JSON string, we parse it.
    const initialEditorState = editorState
        ? (editor) => { // LexicalComposer accepts a function for initial editorState
            try {
                const parsedState = JSON.parse(editorState);
                editor.setEditorState(editor.parseEditorState(parsedState));
            } catch (e) {
                console.error('Failed to parse editorState from prop:', e);
                // Fallback to empty editor if parsing fails
                editor.setEditorState(editor.parseEditorState(JSON.parse('{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}')));
            }
        }
        : null; // If editorState prop is null/undefined, Lexical will start with an empty editor

    // Any custom nodes being used
    const editorNodes = [
        ListNode,
        ListItemNode,
        HeadingNode,
        LinkNode,
    ];

    const initialConfig = {
        namespace: 'MyEditor',
        theme,
        onError,
        nodes: editorNodes, // <--- Crucial: Lexical needs to know about all possible nodes
        editorState: initialEditorState, // <--- Pass the prepared initial state here
    };

    const onChange = (editorState) => {
        const editorStateJSON = editorState.toJSON();  // Produces a serialization safe string
        setEditorState(JSON.stringify(editorStateJSON));  // converts the javaScript object to a JSON string
    }

    // useEffect(() => {
    //     console.log('Editor state changed:', editorState);
    // }, [editorState]);

    return (
        <>
            <div className='header'>
                <h1>My Editor</h1>
                <Button className='button' variant="contained" color="primary" onClick={() => setIsEditable(!isEditable)}>
                    {`Switch to ${isEditable ? 'View' : 'Edit'} Mode`}
                </Button>
            </div>

            <div className='my-container'>
                <LexicalComposer initialConfig={initialConfig}>
                    <div className='editor-inner'>
                        <div className='table-of-contents'>
                            <TOCPlugin />
                        </div>
                        <div className='editor-main-content'>
                            {isEditable && <ToolbarPlugin />}  {/* Toolbar for formatting options */}
                            <RichTextPlugin
                                contentEditable={
                                    <ContentEditable
                                        className="content-editable"
                                    />
                                }
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                        </div>
                    </div>
                    <EditorEditableControlPlugin isEditable={isEditable} />
                    <HotkeyPlugin />  {/* Custom hotkeys for formatting */}
                    <HistoryPlugin />  {/* Undo/Redo functionality, ctrl + z / y */}
                    <AutoFocusPlugin />  {/* Automatically focuses the editor when it mounts */}
                    <TreeViewPlugin />  {/* Tree view for debugging and structure visualization */}
                    <ReactLinkPlugin />
                    <ReactListPlugin />
                    <CheckListPlugin />  {/* For checklists, allows for checkbox lists */}
                    {/* <TabIndentationPlugin />  needed for tabbing in lists, has bugs */}
                    {/* <ReactTableOfContentsPlugin >
                        {({ headings, editor }) => { // <--- This is the render prop function
                            console.log('Headings from ReactTableOfContentsPlugin render prop:', headings); // <--- ADD THIS LOG
                            console.log('Is headings an array here?', Array.isArray(headings)); // <--- ADD THIS LOG
                            return ( */}



                    {/* Custom plugins can be added here */}
                    <OnChangePlugin onChange={onChange} />
                </LexicalComposer>
            </div>
        </>
    );
}

export default Editor;