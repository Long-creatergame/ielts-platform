import React from 'react';

export default function AudioPlayer({ src, ...props }) {
  if (!src) return null;
  return (
    <audio src={src} controls preload="none" {...props} />
  );
}


