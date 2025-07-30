import { DecoratorNode } from 'lexical';
import React from 'react';

export class ImageNode extends DecoratorNode {
  constructor(src, altText, key) {
    super(key);
    this.__src = src;
    this.__altText = altText;
  }

  static getType() {
    return 'image';
  }

  static clone(node) {
    return new ImageNode(node.__src, node.__altText, node.__key);
  }

  createDOM() {
    return document.createElement('span');
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return (
      <img
        src={this.__src}
        alt={this.__altText}
        style={{ maxWidth: '100%', display: 'block', margin: '1em 0' }}
      />
    );
  }

  static importJSON(serializedNode) {
    return new ImageNode(serializedNode.src, serializedNode.altText);
  }

  exportJSON() {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      altText: this.__altText,
    };
  }
}

export function $createImageNode(src, altText) {
  return new ImageNode(src, altText);
}

export function $isImageNode(node) {
  return node instanceof ImageNode;
}
