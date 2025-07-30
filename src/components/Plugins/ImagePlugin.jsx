import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { IconButton, Tooltip } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import { $insertNodes } from 'lexical';
import { $createImageNode } from '../Nodes/ImageNode'; // Import the ImageNode creation function
import React from 'react';

const ImagePlugin = () => {
  const [editor] = useLexicalComposerContext();

  const insertImage = (src, altText) => {
    editor.update(() => {
      const imageNode = $createImageNode(src, altText);
      $insertNodes([imageNode]);
    });
  };

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          insertImage(reader.result, file.name);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <Tooltip title="Insert Image">
      <IconButton size="small" onClick={handleImageUpload}>
        <ImageIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default ImagePlugin;
