export const getPageQuery = /* GraphQL */ `
  query getPage($handle: String!) {
    pageByHandle(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
      updatedAt
    }
  }
`;

export const getPagesQuery = /* GraphQL */ `
  query getPages {
    pages(first: 100) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`;
