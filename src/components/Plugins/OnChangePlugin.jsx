import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";

export default function OnChangePlugin({ onChange }) {
    // Access the editor through the Lexical Composer Context - The useEffect will run on initial
    // render and whenever the editor state changes.
    const [editor] = useLexicalComposerContext();

    // Wrap the listener in a useEffect to handle the teadown and avoid stale references.
    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            // if (prevMode.current !== mode) {
            //     prevMode.current = mode; // update reference
                onChange(editorState);          // only call when mode changes
            // }
        });
    }, [editor, onChange]);

    return null;
}