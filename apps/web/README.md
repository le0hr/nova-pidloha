This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Imported category navigation

The shop header reads published categories from Strapi and uses their actual slugs.
Only root categories appear in the header; a root category page includes products
assigned to its descendants. This supports the importer's sheet → class structure
without introducing a subclass menu. The mobile menu uses the same links.

Publish the imported categories and products before expecting them in the storefront.
The category page uses the selected category name and the API's actual product count.
Unknown category slugs return 404. Category data refreshes after up to 60 seconds.

For a non-local CMS, set `STRAPI_URL` (server API) and `NEXT_PUBLIC_STRAPI_URL`
(public media origin) in `.env.local`. If public reads are disabled, set
`STRAPI_READ_TOKEN` to a server-only read token with access to categories, products,
product variations, filter groups/values, and media. Never prefix this token with
`NEXT_PUBLIC_`.

Run the focused tests with `node tests/category-navigation.test.cjs`. The isolated
CMS harness `node ../cms/tests/catalog-import-smoke.cjs` also verifies these exact
frontend GraphQL queries against imported test data; it never uses your CMS database.
