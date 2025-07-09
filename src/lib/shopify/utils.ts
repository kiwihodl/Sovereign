import { ReadonlyURLSearchParams } from 'next/navigation';
import {
  Cart,
  Collection,
  Connection,
  Image,
  Product,
  ShopifyCart,
  ShopifyCollection,
  ShopifyProduct,
} from './types';

export const createUrl = (pathname: string, params: URLSearchParams | ReadonlyURLSearchParams) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? '?' : ''}${paramsString}`;

  return `${pathname}${queryString}`;
};

export const ensureStartsWith = (stringToCheck: string, startsWith: string) =>
  stringToCheck.startsWith(startsWith) ? stringToCheck : `${startsWith}${stringToCheck}`;

export const isShopifyError = (error: any): error is any => {
  return error.status || error.message;
};

export const reshapeCart = (cart: ShopifyCart): Cart => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: '0.0',
      currencyCode: 'USD',
    };
  }

  return {
    ...cart,
    lines: cart.lines.edges.map(edge => edge.node),
  };
};

export const reshapeCollection = (collection: ShopifyCollection): Collection | undefined => {
  if (!collection) {
    return undefined;
  }

  return {
    ...collection,
    path: `/search/${collection.handle}`,
  };
};

export const reshapeCollections = (collections: ShopifyCollection[]) => {
  const reshapedCollections = [];

  for (const collection of collections) {
    if (collection) {
      const reshapedCollection = reshapeCollection(collection);

      if (reshapedCollection) {
        reshapedCollections.push(reshapedCollection);
      }
    }
  }

  return reshapedCollections;
};

export const reshapeProduct = (product: ShopifyProduct, filterHiddenProducts: boolean) => {
  if (!product || (filterHiddenProducts && product.tags.includes('nextjs-commerce-hidden'))) {
    return undefined;
  }

  const { images, variants, ...rest } = product;

  return {
    ...rest,
    images: reshapeImages(images, product.title),
    variants: variants.edges.map(edge => edge.node),
  };
};

export const reshapeProducts = (products: ShopifyProduct[]) => {
  const reshapedProducts = [];

  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product, true);

      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }

  return reshapedProducts;
};

const reshapeImages = (images: Connection<Image>, productTitle: string) => {
  const flattened = images.edges.map(edge => edge.node);

  return flattened.map(image => {
    const filename = image.url.match(/.*\/(.*)\..*/)[1];
    return {
      ...image,
      altText: image.altText || `${productTitle} - ${filename}`,
    };
  });
};
