
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_CHECK_LIST_COMMAND } from '@lexical/list';
import { IconButton, Tooltip } from '@mui/material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import ChecklistIcon from '@mui/icons-material/Checklist';
import { useCallback, useEffect, useRef, useState } from 'react';

const ListPlugin = ({ listType, setListType }) => {
    const [editor] = useLexicalComposerContext();

    // for lists
    const onToggleList = useCallback((type) => {
        // console.log('type', type);
        editor.update(() => {
            if (type === 'ul') {
                editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND);
            } else if (type === 'ol') {
                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND);
            } else if (type === 'checklist') {
                editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND);
            }
        });
    }, [editor]);

    return (
        <>
            <Tooltip title="Unordered List">
                <IconButton
                    size='small'
                    className={listType === 'ul' ? 'active' : ''}
                    onClick={() => onToggleList('ul')}
                >
                    <FormatListBulletedIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Ordered List">
                <IconButton
                    size='small'
                    className={listType === 'ol' ? 'active' : ''}
                    onClick={() => onToggleList('ol')}
                >
                    <FormatListNumberedIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Checklist">
                <IconButton
                    size='small'
                    className={listType === 'checklist' ? 'active' : ''}
                    onClick={() => onToggleList('checklist')}
                >
                    <ChecklistIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </>
    )
}

export default ListPlugin;