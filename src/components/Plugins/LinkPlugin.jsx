import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button, IconButton, Tooltip } from "@mui/material";
import { useCallback } from "react";
import {
    $getSelection,
    $isRangeSelection,
} from 'lexical';
import { TOGGLE_LINK_COMMAND, $isLinkNode } from '@lexical/link';
import LinkIcon from '@mui/icons-material/Link';


const LinkPlugin = ({ isLink, setIsLink }) => {
    const [editor] = useLexicalComposerContext();
        // --- New: Link insertion handler ---
    const onClick = useCallback(() => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                if (isLink) {
                    // If it's already a link, toggle it off (unlink)
                    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                } else {
                    // If not a link, prompt for URL and toggle on
                    const url = prompt('Enter the URL:'); // Or use a custom modal
                    if (url && url.trim() !== '') {
                        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
                    }
                }
            } else {
                // Handle cases where there's no selection, e.g., create a link for "new link" text
                const url = prompt('Enter the URL:');
                if (url && url.trim() !== '') {
                    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
                }
            }
        });
    }, [editor, isLink]); // Depend on editor and isLink state

    return (
        
            <Tooltip title="Link">
                <IconButton
                    size='small'
                    onClick={onClick}
                >
                    <LinkIcon fontSize="small" />
                </IconButton>
            </Tooltip>

    )
}

export default LinkPlugin;


