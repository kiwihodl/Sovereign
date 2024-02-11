import React from "react"

export const useImageProxy = () => {

    const returnImageProxy = (image) => {
        const proxyUrl = `${process.env.NEXT_PUBLIC_PROXY_URL}?imageUrl=${encodeURIComponent(image)}`;

        return proxyUrl;
    }

    return { returnImageProxy };
}