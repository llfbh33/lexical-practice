import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FormControl, Select, MenuItem, Button } from "@mui/material";
import { useState } from "react";
import { $getSelection, $getRoot, $isRangeSelection, ParagraphNode, $createTextNode, $createParagraphNode } from "lexical";
import { HeadingNode } from '@lexical/rich-text';
import { $createHeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from "@lexical/selection";


const headings = [
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
]

const headingLabels = [
    'Paragraph',
    'Heading 1',
    'Heading 2',
    'Heading 3',
    'Heading 4',
    'Heading 5',
    'Heading 6',
]

const HeadingPlugin = ({ heading, setHeading }) => {
    const [editor] = useLexicalComposerContext();

    const onClick = (tag) => {
        // safe way to modify lexical editor state - batches changes and manages undo/redo history properly
        // editor.update(() => {
        //     // grabs the current selection or range in the editor (the line or section the user is currently working with)
        //     const selection = $getSelection();
        //     // checks if it is a range selection (i.e., the user has selected some text)
        //     if (!$isRangeSelection(selection)) return;

        //     // gets all nodes within the current selection (might be multiple nodes)
        //     const nodes = selection.getNodes();
        //     // loop through each node in the selection
        //     nodes.forEach((node) => {
        //         // Text nodes themselves cannot be headings; their parent block (paragraph, div, etc.) holds the block type. So you replace the parent block.
        //         const parent = node.getParent();
        //         // ensure the parent block exists and is not the root node, root node cannot be replaced
        //         if (parent !== null && parent.getType() !== 'root') {
        //             let newNode;
        //             // check if the tag is a 'p' tag, do not set as a heading
        //             if (tag === 'p') {
        //                 newNode = new ParagraphNode();
        //             } else {
        //                 // Create a new HeadingNode to replace the current parent block with
        //                 newNode = new HeadingNode(tag);
        //             }
        //             // Preserve children of the old block (if needed) move from old to new block, while loop to move each child one after the other
        //             while (parent.getChildrenSize() > 0) {
        //                 const child = parent.getFirstChild();
        //                 child.remove();
        //                 newNode.append(child);
        //             }
        //             // replace the parent block with the new HeadingNode
        //             parent.replace(newNode);
        //             // After replacement, update selection to inside the new heading node:
        //             newNode.select();
        //         }
        //     });
        // });

        editor.update(() => {

            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;

            $setBlocksType(selection, () => {
                if (tag === 'p') {
                    return $createParagraphNode();
                } else {
                    return $createHeadingNode(tag);
                }
            });
        });
    };

    return (
        <FormControl variant="standard" sx={{ minWidth: 120, margin: '0 8px' }}>
            <Select
                label="Heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
            >
                {headings.map((option, index) => (
                    <MenuItem key={option} value={option} onClick={() => onClick(option)}>
                        {headingLabels[index]}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}

export default HeadingPlugin;