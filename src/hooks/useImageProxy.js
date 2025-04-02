import React from 'react';

export const useImageProxy = () => {
  // This function handles image URL generation for avatars
  // It can process custom avatars, generate Gravatar URLs, or provide a default avatar
  const returnImageProxy = (image, pubkey, size = 90) => {
    // If a custom image URL is provided
    if (image) {
      // Use the proxy URL to avoid CORS issues and potentially optimize the image
      const proxyUrl = `${process.env.NEXT_PUBLIC_PROXY_URL}?imageUrl=${encodeURIComponent(image)}`;
      return proxyUrl;
    }
    // If no image is provided, but a pubkey is available
    else if (pubkey) {
      // Generate a Gravatar URL using the pubkey as the identifier
      // 's' parameter sets the size of the image
      // 'd=identicon' ensures a default identicon is generated if no Gravatar exists for this pubkey
      return `https://secure.gravatar.com/avatar/${pubkey}?s=${size}&d=identicon`;
    }
    // If neither image nor pubkey is provided
    else {
      // Return a completely generic Gravatar URL
      // This will always generate a random identicon
      return `https://secure.gravatar.com/avatar/?s=${size}&d=identicon`;
    }
  };

  // Return the function so it can be used by components
  return { returnImageProxy };
};
