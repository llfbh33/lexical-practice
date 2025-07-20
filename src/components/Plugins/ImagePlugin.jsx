import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { IconButton, Tooltip } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';



const ImagePlugin = () => {
    const [editor] = useLexicalComposerContext();

    // const onClick = () => {
        // editor.update(() => {

    return (
        <>
        <Tooltip title="Image">
            <IconButton
                size='small'
                onClick={() => {  console.log('Insert Image Clicked'); }}
            >
                <ImageIcon fontSize="small" />
            </IconButton>
        </Tooltip>
        </>
    )
}

export default ImagePlugin;