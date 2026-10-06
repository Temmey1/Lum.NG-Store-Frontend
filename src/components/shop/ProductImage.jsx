import React, { useState } from 'react';
import { resolveImageUrl } from '../../api/index';

/**
 * Fills its parent container (use a sized wrapper div around it).
 * Shows a specific image by index if given (for galleries), otherwise the
 * product's primary image (images[0], falling back to the legacy single
 * imageUrl field for products not yet re-saved since multi-image support
 * was added). Falls back to the CSS gradient pattern when there's no image
 * at all, or if the image URL fails to actually load.
 *
 * Pass `overrideUrl` to force a specific image regardless of `index` — used
 * for cart/checkout rows where a customer picked a particular gallery photo
 * for their order (cart item's `selectedImage`), so the thumbnail shown
 * matches what they chose rather than always the product's default.
 */
export default function ProductImage({ product, index = 0, overrideUrl = null, className = '' }) {
  const [failed, setFailed] = useState(false);
  const url = overrideUrl ?? (product?.images?.[index] ?? (index === 0 ? product?.imageUrl : null));
  const src = resolveImageUrl(url);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={product?.name || ''}
        className={`w-full h-full object-cover ${className}`}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
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
