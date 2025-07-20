import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister, $getNearestNodeOfType } from '@lexical/utils';
import {
    $createTextNode,
    $getSelection,
    $isRangeSelection,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_LOW,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
} from 'lexical';
import {
    INSERT_UNORDERED_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
    $isListNode,
    $isListItemNode,
    ListNode,
    $insertList,
    ListItemNode,
} from '@lexical/list';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IconButton, Paper, Tooltip, Divider, Button, Link } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import HeadingPlugin from './HeadingPlugin';
import { TOGGLE_LINK_COMMAND, $isLinkNode } from '@lexical/link';
import LinkPlugin from './LinkPlugin';
import ImagePlugin from './ImagePlugin';
import ListPlugin from './ListPlugin';
import { HeadingNode, $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
// import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';


// Manages UI updates based on editor state changes
const ToolbarPlugin = () => {
    const [editor] = useLexicalComposerContext();
    const toolbarRef = useRef(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [heading, setHeading] = useState('p'); // default to paragraph
    const [isLink, setIsLink] = useState(false);
    const [listType, setListType] = useState(null); // default to unordered list

    // updates the state of the toolbar buttons, common practice to use $ to recognize helper functions
    const $updateToolbar = useCallback(() => {
        const selection = $getSelection();    // gets the current selection in the editor imported helper function
        if (!$isRangeSelection(selection)) {
            setIsLink(false);
            setHeading('p');
            setListType(null);
            return;
        }
        // Update text format
        setIsBold(selection.hasFormat('bold'));
        setIsItalic(selection.hasFormat('italic'));
        setIsUnderline(selection.hasFormat('underline'));
        setIsStrikethrough(selection.hasFormat('strikethrough'));


        // --- Determine Current Block Type (Heading, Paragraph, List) ---
        const anchorNode = selection.anchor.getNode();

        let currentBlockTypeForDropdown = 'p'; // For the heading dropdown
        let currentActiveListTypeForButtons = null; // For the list buttons

        // --- NEW LOGIC FOR LISTS ---
        // First, try to find the nearest ListItemNode (<li>) containing the selection.
        const listItemNode = $getNearestNodeOfType(anchorNode, ListItemNode); // <--- Use this!

        if (listItemNode) { // If we found a ListItemNode, we are inside a list.
            const listNode = listItemNode.getParent(); // This will be the <ul> or <ol>
            if ($isListNode(listNode)) { // Double check it's a valid list parent
                // console.log(listItemNode.getChecked());
                const isCheckItem = listItemNode.getChecked();
                // console.log('isCheckItem', isCheckItem);

                if (isCheckItem !== null) {
                    currentActiveListTypeForButtons = 'checklist'; // If it's a checklist item
                } else {
                    currentActiveListTypeForButtons = listNode.getTag(); // Get 'ul' or 'ol'
                };
            }
            // console.log('currentActiveListTypeForButtons', currentActiveListTypeForButtons);
            // When in a list, the main heading dropdown should typically revert to 'p'
            currentBlockTypeForDropdown = 'p';
        } else {
            // --- OLD LOGIC FOR OTHER BLOCK TYPES (if not in a list) ---
            // If not in a list item, then check other top-level elements.
            const blockParent = anchorNode.getTopLevelElement(); // Fallback for non-list blocks

            if (blockParent) {
                if ($isHeadingNode(blockParent)) {
                    currentBlockTypeForDropdown = blockParent.getTag();
                } else if (blockParent.getType() === 'paragraph') {
                    currentBlockTypeForDropdown = 'p';
                }
                // Removed the `$isListItemNode` check here as it's now handled above
                // Add other block type checks if needed (e.g., $isCodeNode, $isQuoteNode)
                else {
                    currentBlockTypeForDropdown = 'p'; // Fallback for unhandled block types
                }
            } else {
                currentBlockTypeForDropdown = 'p'; // Fallback if no block parent (e.g., empty editor)
            }
        }

        setHeading(currentBlockTypeForDropdown);
        setListType(currentActiveListTypeForButtons); // Update the new list state


        // --- Link Status ---
        const nodes = selection.getNodes();
        let foundLink = false;
        for (const node of nodes) {
            if ($isLinkNode(node)) {
                foundLink = true;
                break;
            }
            // Check if parent is a link node if selection is inside a link
            const parent = node.getParent();
            if ($isLinkNode(parent)) {
                foundLink = true;
                break;
            }
        }
        setIsLink(foundLink);

    }, []);

    // editor.getEditorState().read(() => {
    //     const selection = $getSelection();
    //     console.log('Selection formats: ', selection);
    // });


    useEffect(() => {
        // returns an unsubscribed cleanup when the component unmounts - removes listeners and commands
        /*
          - You’d leave behind old event listeners
          - You might get memory leaks
          - Commands could fire multiple times
          - Stale closures could access outdated state
        */
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {  // fires whenever the editor state updates
                editorState.read(() => {
                    $updateToolbar();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,  // runs when section changes (cursor movement, highlighting, etc.)
                (_payload, _newEditor) => {
                    $updateToolbar();
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(  // enables / disables the undo button
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(  // enables / disables the redo button
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            // editor.registerCommand(
            //     INSERT_UNORDERED_LIST_COMMAND,
            //     () => {
            //         $insertList(editor, 'bullet')
            //         return true;
            //     },
            //     COMMAND_PRIORITY_LOW,
            // ),
            // do not need to include a section for FORMAT_TEXT_COMMAND as the updateToolbar function already handles text formatting updates
        );
    }, [editor, $updateToolbar]);

    // // *** NEW HELPER FUNCTION FOR LIST COMMANDS ***
    // const formatList = (e) => {
    //     editor.update(() => {
    //         const selection = $getSelection();
    //         if ($isRangeSelection(selection)) {
    //             const anchorNode = selection.anchor.getNode();
    //             const parent = anchorNode.getParent;

    //             if (parent && $isListNode(parent)) {
    //                 // If the selection is already in a list, remove it
    //                 editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    //             } else {
    //                 editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    //             }
    //         }
    //     })
    //     editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    // };




    return (
        <Paper className="tool-bar" ref={toolbarRef}>
            <Tooltip title="Undo">
                <span>
                    <IconButton
                        size='small'
                        disabled={!canUndo}
                        onClick={() => {
                            editor.dispatchCommand(UNDO_COMMAND, undefined);
                        }}
                    >
                        <UndoIcon fontSize='small' />
                    </IconButton>
                </span>
            </Tooltip>
            <Tooltip title="Redo">
                <span>
                    <IconButton
                        size='small'
                        disabled={!canRedo}
                        onClick={() => {
                            editor.dispatchCommand(REDO_COMMAND, undefined);
                        }}
                    >
                        <RedoIcon fontSize='small' />
                    </IconButton>
                </span>
            </Tooltip>
            <Divider orientation="vertical" flexItem />
            <Tooltip title="Left Align">
                <IconButton
                    size='small'
                    onClick={() => {
                        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
                    }}
                >
                    <FormatAlignLeftIcon fontSize='small' />
                </IconButton>
            </Tooltip>
            <Tooltip title="Center Align">
                <IconButton
                    size='small'
                    onClick={() => {
                        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
                    }}
                >
                    <FormatAlignCenterIcon fontSize='small' />
                </IconButton>
            </Tooltip>
            <Tooltip title="Right Align">
                <IconButton
                    size='small'
                    onClick={() => {
                        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
                    }}
                >
                    <FormatAlignRightIcon fontSize='small' />
                </IconButton>
            </Tooltip>
            <Divider orientation='vertical' flexItem />
            <Tooltip title="Bold">
                <IconButton
                    size='small'
                    className={isBold ? 'active' : ''}
                    onClick={() => {
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
                    }}
                >
                    <FormatBoldIcon fontSize='small' />
                </IconButton>
            </Tooltip>
            <Tooltip title="Italic">
                <IconButton
                    size='small'
                    className={isItalic ? 'active' : ''}
                    onClick={() => {
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
                    }}
                >
                    <FormatItalicIcon fontSize='small' />
                </IconButton>
            </Tooltip>
            <Tooltip title="Underline">
                <IconButton
                    size='small'
                    className={isUnderline ? 'active' : ''}
                    onClick={() => {
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
                    }}
                >
                    <FormatUnderlinedIcon fontSize='small' />
                </IconButton>
            </Tooltip>
            <Tooltip title="Strikethrough">
                <IconButton
                    size='small'
                    className={isStrikethrough ? 'active' : ''}
                    onClick={() => {
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
                    }}
                >
                    <StrikethroughSIcon fontSize='small' />
                </IconButton>
            </Tooltip>

            <Divider orientation='vertical' flexItem />
            <ListPlugin listType={listType} setListType={setListType} />
            <Divider orientation='vertical' flexItem />
            <LinkPlugin isLink={isLink} setIsLink={setIsLink} />
            <ImagePlugin />
            <Divider orientation='vertical' flexItem />
            <HeadingPlugin heading={heading} setHeading={setHeading} />
        </Paper>
    );
}

export default ToolbarPlugin;


