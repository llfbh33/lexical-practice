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
import { $getNearestNodeOfType } from '@lexical/utils';
import {
    ListNode, ListItemNode,
    $isListNode, $isListItemNode,
    $createListNode,
} from '@lexical/list';
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

                // same functionality as using the lexical ListIndentationPlugin - but with shift click added in 
                // both the lexical and this one have the same bug, the structure of the lists are not formated correctly
                // if (key === 'Tab') {
                //     event.preventDefault(); // Prevent default browser tab behavior
                //     editor.dispatchCommand(
                //         shiftKey ? OUTDENT_CONTENT_COMMAND : INDENT_CONTENT_COMMAND,
                //         undefined
                //     );
                //     return true; // Indicate that we handled the Tab key
                // }

                // --- Handle Tab (for lists indent/outdent) ---
                // MOVED OUTSIDE THE CTRL/CMD CHECK
                if (key === 'Tab') {
                    event.preventDefault(); // Crucial: Prevent default browser behavior

                    editor.update(() => {
                        const selection = $getSelection();
                        if (!$isRangeSelection(selection)) {
                            return false;
                        }

                        const anchorNode = selection.anchor.getNode();
                        const listItemNode = $getNearestNodeOfType(anchorNode, ListItemNode);

                        if (!listItemNode) {
                            return false; // Not in a list, don't handle
                        }

                        const currentIndent = listItemNode.getIndent();

                        if (shiftKey) {
                            // --- OUTDENT LOGIC (Shift + Tab) ---
                            if (currentIndent > 0) {
                                const parentList = listItemNode.getParent(); // The UL/OL this item is directly in
                                const grandparentNode = parentList?.getParent(); // The LI or ROOT that contains this UL/OL

                                // Case 1: Outdent from a nested list item into a higher-level list item
                                if ($isListNode(parentList) && $isListItemNode(grandparentNode)) {
                                    listItemNode.remove(); // Remove from current parent list
                                    grandparentNode.insertAfter(listItemNode); // Insert as sibling after its grandparent LI
                                    listItemNode.setIndent(currentIndent - 1); // Decrement indent

                                    // Clean up empty parent list if it becomes empty
                                    if (parentList.getChildrenSize() === 0) {
                                        parentList.remove();
                                    }

                                    // FIX: Restore focus to the outdented item
                                    listItemNode.select();

                                } else if ($isListNode(parentList) && $isRootNode(grandparentNode)) {
                                    // Case 2: Outdent from a top-level list item (indent 1 -> 0) directly under the RootNode
                                    // This converts it to a paragraph and moves it out of the list completely.
                                    // This is the desired behavior for "moving into the children of the next list above"
                                    // if "above" means the root, and it's the top-level list.
                                    listItemNode.remove(); // Remove from the top-level list
                                    parentList.insertAfter(listItemNode); // Insert after the top-level UL/OL itself
                                    listItemNode.setIndent(currentIndent - 1); // Indent becomes 0

                                    // If parentList (the top-level ul/ol) becomes empty, remove it.
                                    if (parentList.getChildrenSize() === 0) {
                                        parentList.remove();
                                    }

                                    // FIX: Restore focus to the outdented item
                                    listItemNode.select();

                                } else {
                                    // Fallback: This case indicates an unexpected list structure, or needs more specific handling
                                    // For now, just decrement indent if explicit re-parenting is not possible
                                    listItemNode.setIndent(currentIndent - 1);
                                    listItemNode.select();
                                }

                            } else {
                                // If at first level (indent 0), convert to paragraph
                                $setBlocksType(selection, () => $createParagraphNode());
                                // FIX: Restore focus to the newly created paragraph
                                // After $setBlocksType, the selection is automatically placed on the new paragraph.
                                // $getSelection() should now point to the new paragraph's range selection.
                                // $setSelection(selection.clone()); // Clone to ensure it's fresh if needed, but often not
                                // Or simply `selection.select()` if it's the only operation.
                                // For basic case, `selection` should already be on the new paragraph.
                                // Just ensuring it's selected.
                                selection.select();
                            }
                        } else {
                            // --- INDENT LOGIC ---
                            const previousSibling = listItemNode.getPreviousSibling();

                            if ($isListItemNode(previousSibling)) {
                                let nestedList = previousSibling.getLastChild();
                                if (!$isListNode(nestedList)) {
                                    const parentList = listItemNode.getParent();
                                    if ($isListNode(parentList)) {
                                        nestedList = $createListNode(parentList.getTag());
                                        previousSibling.append(nestedList);
                                    } else {
                                        return false; // Should not happen
                                    }
                                }

                                listItemNode.remove(); // Temporarily remove from old parent
                                nestedList.append(listItemNode); // Append to new nested list
                                listItemNode.setIndent(currentIndent + 1); // Increase indent property

                                // --- FIX: Restore focus after indent ---
                                listItemNode.select(); // Select the node just moved
                            } else {
                                // If no suitable previous sibling to nest under, do nothing
                                return false;
                            }
                        }
                    }); // End editor.update()

                    return true;
                }

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

