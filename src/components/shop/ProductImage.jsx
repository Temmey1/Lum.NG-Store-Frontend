import React from 'react';
import { resolveImageUrl } from '../../api/index';

/**
 * Fills its parent container (use a sized wrapper div around it).
 * Falls back to the product's CSS gradient pattern when no image is set —
 * every existing product still renders correctly without needing images.
 */
export default function ProductImage({ product, className = '' }) {
  const src = resolveImageUrl(product?.imageUrl);
  if (src) {
    return (
      <img
        src={src}
        alt={product?.name || ''}
        className={`w-full h-full object-cover ${className}`}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={`w-full h-full ${className}`}
      style={{ background: product?.pattern || 'linear-gradient(135deg,#1a1a1a,#333)' }}
    />
  );
}
