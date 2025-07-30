import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { IconButton, Tooltip } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { $createVideoNode } from '../Nodes/VideoNode'; // adjust the path
import { $insertNodes } from 'lexical';

const VideoPlugin = () => {
  const [editor] = useLexicalComposerContext();

  const handleVideoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file); // blob URL (temporary)
        editor.update(() => {
          const videoNode = $createVideoNode(url);
          $insertNodes([videoNode]);
        });
      }
    };
    input.click();
  };

  return (
    <Tooltip title="Insert Video">
      <IconButton size="small" onClick={handleVideoUpload}>
        <PlayCircleOutlineIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default VideoPlugin;
