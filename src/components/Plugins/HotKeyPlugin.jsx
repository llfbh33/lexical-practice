import { useEffect } from 'react';
import {
    useLexicalComposerContext,
} from '@lexical/react/LexicalComposerContext';
import {
    FORMAT_TEXT_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    KEY_DOWN_COMMAND,
    COMMAND_PRIORITY_LOW,
    INDENT_CONTENT_COMMAND,
    OUTDENT_CONTENT_COMMAND,
    $getSelection,
    $isRangeSelection,
    $createParagraphNode,
    COMMAND_PRIORITY_NORMAL,
    COMMAND_PRIORITY_HIGH,
} from 'lexical';
import { HeadingNode } from '@lexical/rich-text';
import { $createHeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from "@lexical/selection";
// import { $indentList, $outdentList } from '@lexical/list';


// Responds to keyboard events
export default function HotkeyPlugin() {
    // Access the editor through the Lexical Composer Context
    const [editor] = useLexicalComposerContext();
    const headingKeys = ['1', '2', '3', '4', '5', '6'];

    // useEffect(() => {
    //     const handleKeyDown = (event) => {
    //         if (event.key === 'Tab') {
    //             event.preventDefault(); // Prevent default immediately

    //             editor.update(() => {
    //                 const selection = $getSelection();
    //                 if ($isRangeSelection(selection)) {
    //                     editor.dispatchCommand(
    //                         event.shiftKey ? OUTDENT_CONTENT_COMMAND : INDENT_CONTENT_COMMAND,
    //                         undefined
    //                     );
    //                 }
    //             });
    //         }
    //     };

    //     const rootElement = editor.getRootElement();
    //     rootElement?.addEventListener('keydown', handleKeyDown);

    //     return () => {
    //         rootElement?.removeEventListener('keydown', handleKeyDown);
    //     };
    // }, [editor]);



    useEffect(() => {
        return editor.registerCommand(
            KEY_DOWN_COMMAND,
            (event) => {
                const { key, ctrlKey, metaKey, altKey, shiftKey } = event;
                const isCtrlOrCmd = ctrlKey || metaKey; // Cross-platform Ctrl/Cmd

                // // --- Handle Tab (for lists indent/outdent) ---
                // // MOVED OUTSIDE THE CTRL/CMD CHECK
                // if (key === 'Tab') {
                //     event.preventDefault(); // Prevent default browser tab behavior
                //     editor.dispatchCommand(
                //         shiftKey ? OUTDENT_CONTENT_COMMAND : INDENT_CONTENT_COMMAND,
                //         undefined
                //     );
                //     return true; // Indicate that we handled the Tab key
                // }

                // --- Handle Ctrl/Cmd + shortcuts ---
                if (isCtrlOrCmd && !altKey) {
                    const lowercasedKey = key.toLowerCase();

                    // Ctrl/Cmd + X for Strikethrough
                    if (lowercasedKey === 'x') {
                        event.preventDefault();
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
                        return true;
                    }

                    // Ctrl/Cmd + L for Align Left
                    if (lowercasedKey === 'l') {
                        event.preventDefault();
                        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
                        return true;
                    }

                    // Ctrl/Cmd + E for Align Center
                    if (lowercasedKey === 'e') {
                        event.preventDefault();
                        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
                        return true;
                    }

                    // Ctrl/Cmd + R for Align Right
                    if (lowercasedKey === 'r') {
                        event.preventDefault();
                        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
                        return true;
                    }

                    // Ctrl/Cmd + (1-6) for Headings, Ctrl/Cmd + P for Paragraph
                    if (headingKeys.includes(lowercasedKey) || lowercasedKey === 'p') {
                        event.preventDefault();
                        editor.update(() => {
                            const selection = $getSelection();
                            if (!$isRangeSelection(selection)) return;

                            $setBlocksType(selection, () => {
                                if (lowercasedKey === 'p') {
                                    return $createParagraphNode();
                                } else {
                                    const headingLevel = parseInt(lowercasedKey, 10);
                                    const tag = `h${headingLevel}`;
                                    return $createHeadingNode(tag);
                                }
                            });
                        });
                        return true;
                    }
                }

                return false; // Important: Return false if no custom hotkey was handled
            },
            COMMAND_PRIORITY_HIGH
        );
    }, [editor]);

    return null;
}



/*


    useEffect(() => {
        return editor.registerCommand(
            KEY_DOWN_COMMAND,
            (event) => {
                if ((event.ctrlKey || event.metaKey) && !event.altKey) {
                    const key = event.key.toLowerCase();

                    if (key === 'x') {
                        event.preventDefault();
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
                        return true;
                    }

                    if (key === 'l') {
                        event.preventDefault();
                        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
                        return true;
                    }

                    if (key === 'e') {    // expected shortcut key in microsoft word
                        event.preventDefault();
                        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
                        return true;
                    }

                    if (key === 'r') {
                        event.preventDefault();
                        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
                        return true;
                    }

                    // Heading Shortcuts
                    if (headingKeys.includes(key) || key === 'p') {
                        event.preventDefault();
                        const headingLevel = parseInt(key, 10);
                        const tag = `h${headingLevel}`;
                        editor.update(() => {
                            const selection = $getSelection();
                            if (!$isRangeSelection(selection)) return;

                            $setBlocksType(selection, () => {
                                if (key === 'p') {
                                    return $createParagraphNode();
                                } else {
                                    return $createHeadingNode(tag);
                                }
                            });
                        });
                        return true;
                    }
                    // handle list tabs
                    if (event.key === 'Tab') {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            event.preventDefault();
                            editor.dispatchCommand(
                                event.shiftKey ? OUTDENT_CONTENT_COMMAND : INDENT_CONTENT_COMMAND,
                                undefined
                            );
                            return true;
                        }
                    }
                }

                return false;
            },
            COMMAND_PRIORITY_LOW
        );
    }, [editor]);

    return null;
}


*/

