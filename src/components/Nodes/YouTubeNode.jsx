import { DecoratorNode } from 'lexical';
import React from 'react';

export class YouTubeNode extends DecoratorNode {
  constructor(videoId, key) {
    super(key);
    this.__videoId = videoId;
  }

  static getType() {
    return 'youtube';
  }

  static clone(node) {
    return new YouTubeNode(node.__videoId, node.__key);
  }

  createDOM() {
    return document.createElement('span');
  }

  updateDOM() {
    return false;
  }

  decorate() {
    const embedUrl = `https://www.youtube.com/embed/${this.__videoId}`;
    return (
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, margin: '1em 0' }}>
        <iframe
          src={embedUrl}
          title="YouTube Video"
          frameBorder="0"
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '500px',
            height: '300px'
          }}
        />
      </div>
    );
  }

  static importJSON(json) {
    return new YouTubeNode(json.videoId);
  }

  exportJSON() {
    return {
      type: 'youtube',
      version: 1,
      videoId: this.__videoId
    };
  }
}

export function $createYouTubeNode(videoId) {
  return new YouTubeNode(videoId);
}

export function $isYouTubeNode(node) {
  return node instanceof YouTubeNode;
}
