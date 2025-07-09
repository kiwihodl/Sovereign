import { SHOPIFY_GRAPHQL_API_ENDPOINT, TAGS } from './constants';
import {
  Cart,
  Collection,
  Menu,
  Page,
  Product,
  ShopifyCartOperation,
  ShopifyCollectionOperation,
  ShopifyCollectionProductsOperation,
  ShopifyCollectionsOperation,
  ShopifyMenuOperation,
  ShopifyPageOperation,
  ShopifyPagesOperation,
  ShopifyProductOperation,
  ShopifyProductRecommendationsOperation,
  ShopifyProductsOperation,
} from './types';
import {
  addToCartMutation,
  createCartMutation,
  editCartItemsMutation,
  removeFromCartMutation,
} from './mutations/cart';
import { getCartQuery } from './queries/cart';
import {
  getCollectionProductsQuery,
  getCollectionQuery,
  getCollectionsQuery,
} from './queries/collection';
import { getMenuQuery } from './queries/menu';
import { getPageQuery, getPagesQuery } from './queries/page';
import {
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery,
} from './queries/product';
import {
  reshapeCart,
  reshapeCollection,
  reshapeCollections,
  reshapeProduct,
  reshapeProducts,
} from './utils';

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const endpoint = `https://${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
const key = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

type ExtractVariables<T> = T extends { variables: object } ? T['variables'] : never;

async function shopifyFetch<T>({
  query,
  variables,
  cache = 'force-cache',
}: {
  query: string;
  variables?: ExtractVariables<T>;
  cache?: RequestCache;
}): Promise<{ status: number; body: T } | never> {
  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': key!,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
      cache,
    });

    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body,
    };
  } catch (e) {
    throw {
      error: e,
      query,
    };
  }
}

export async function createCart(): Promise<Cart> {
  const res = await shopifyFetch<ShopifyCartOperation>({
    query: createCartMutation,
    cache: 'no-store',
  });

  return reshapeCart(res.body.data.cartCreate.cart);
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const res = await shopifyFetch<ShopifyCartOperation>({
    query: addToCartMutation,
    variables: {
      cartId,
      lines,
    },
    cache: 'no-store',
  });
  return reshapeCart(res.body.data.cartLinesAdd.cart);
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  const res = await shopifyFetch<ShopifyCartOperation>({
    query: removeFromCartMutation,
    variables: {
      cartId,
      lineIds,
    },
    cache: 'no-store',
  });

  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const res = await shopifyFetch<ShopifyCartOperation>({
    query: editCartItemsMutation,
    variables: {
      cartId,
      lines,
    },
    cache: 'no-store',
  });

  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}

export async function getCart(cartId: string): Promise<Cart | undefined> {
  const res = await shopifyFetch<ShopifyCartOperation>({
    query: getCartQuery,
    variables: { cartId },
    cache: 'no-store',
  });

  if (!res.body.data.cart) {
    return undefined;
  }

  return reshapeCart(res.body.data.cart);
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  const res = await shopifyFetch<ShopifyCollectionOperation>({
    query: getCollectionQuery,
    variables: {
      handle,
    },
  });

  return reshapeCollection(res.body.data.collection);
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
    query: getCollectionProductsQuery,
    variables: {
      handle: collection,
      reverse,
      sortKey: sortKey === 'CREATED_AT' ? 'CREATED' : sortKey,
    },
  });

  if (!res.body.data.collection) {
    console.log(`No collection found for \`${collection}\``);
    return [];
  }

  return reshapeProducts(res.body.data.collection.products.edges.map(edge => edge.node));
}

export async function getCollections(): Promise<Collection[]> {
  const res = await shopifyFetch<ShopifyCollectionsOperation>({ query: getCollectionsQuery });
  const shopifyCollections = res.body.data.collections.edges.map(edge => edge.node);

  return [
    {
      handle: '',
      title: 'All',
      description: 'All products',
      seo: {
        title: 'All',
        description: 'All products',
      },
      path: '/search',
      updatedAt: new Date().toISOString(),
    },
    ...reshapeCollections(shopifyCollections).filter(
      collection => !collection.handle.startsWith('hidden')
    ),
  ];
}

export async function getMenu(handle: string): Promise<Menu[]> {
  const res = await shopifyFetch<ShopifyMenuOperation>({
    query: getMenuQuery,
    variables: {
      handle,
    },
  });

  return (
    res.body.data.menu?.items.map((item: { title: string; url: string }) => ({
      title: item.title,
      path: item.url.replace(domain, '').replace('/collections', '/search'),
    })) || []
  );
}

export async function getPage(handle: string): Promise<Page> {
  const res = await shopifyFetch<ShopifyPageOperation>({
    query: getPageQuery,
    variables: { handle },
  });

  return res.body.data.pageByHandle;
}

export async function getPages(): Promise<Page[]> {
  const res = await shopifyFetch<ShopifyPagesOperation>({ query: getPagesQuery });
  return res.body.data.pages.edges.map(edge => edge.node);
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  const res = await shopifyFetch<ShopifyProductOperation>({
    query: getProductQuery,
    variables: {
      handle,
    },
  });

  return reshapeProduct(res.body.data.product, false);
}

export async function getProductRecommendations(productId: string): Promise<Product[]> {
  const res = await shopifyFetch<ShopifyProductRecommendationsOperation>({
    query: getProductRecommendationsQuery,
    variables: {
      productId,
    },
  });
  return reshapeProducts(res.body.data.productRecommendations);
}

export async function getProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const res = await shopifyFetch<ShopifyProductsOperation>({
    query: getProductsQuery,
    variables: {
      query,
      reverse,
      sortKey,
    },
  });

  if (!res.body.data.products) {
    return [];
  }

  return reshapeProducts(res.body.data.products.edges.map(edge => edge.node));
}
