import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { IconButton, Tooltip } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { $createYouTubeNode } from '../Nodes/YouTubeNode'; // adjust path
import { $insertNodes } from 'lexical';

const extractYouTubeId = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1);
    } else if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v');
    }
    return null;
  } catch {
    return null;
  }
};

const YouTubePlugin = () => {
  const [editor] = useLexicalComposerContext();

  const handleInsert = () => {
    const url = prompt('Enter YouTube URL:');
    if (url) {
      const videoId = extractYouTubeId(url);
      if (videoId) {
        editor.update(() => {
          const node = $createYouTubeNode(videoId);
          $insertNodes([node]);
        });
      } else {
        alert('Invalid YouTube URL.');
      }
    }
  };

  return (
    <Tooltip title="Insert YouTube Video">
      <IconButton size="small" onClick={handleInsert}>
        <YouTubeIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default YouTubePlugin;
