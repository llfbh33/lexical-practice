import { DecoratorNode } from 'lexical';
import React from 'react';

export class VideoNode extends DecoratorNode {
  constructor(src, key) {
    super(key);
    this.__src = src;
  }

  static getType() {
    return 'video';
  }

  static clone(node) {
    return new VideoNode(node.__src, node.__key);
  }

  createDOM() {
    return document.createElement('span');
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return (
      <video
        src={this.__src}
        controls
        style={{
          width: '500px',
          height: '300px',
          display: 'block',
          margin: '1em 0'
        }}
      />
    );
  }

  static importJSON(json) {
    return new VideoNode(json.src);
  }

  exportJSON() {
    return {
      type: 'video',
      version: 1,
      src: this.__src
    };
  }
}

export function $createVideoNode(src) {
  return new VideoNode(src);
}

export function $isVideoNode(node) {
  return node instanceof VideoNode;
}
