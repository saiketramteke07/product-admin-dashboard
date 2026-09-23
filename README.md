# Product Admin Dashboard

## Overview

A production-quality Product Admin Dashboard built with Next.js, React, TypeScript, Tailwind CSS, and Axios. Users can log in, browse products, search, filter by category, sort, paginate, view product details, and perform full CRUD operations (add, edit, delete).

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Axios**
- **DummyJSON API** — https://dummyjson.com

## Features

- ✅ Authentication (login / logout) with token stored in localStorage
- ✅ Protected routes — unauthenticated users redirected to `/login`
- ✅ Product list with desktop table + mobile cards
- ✅ Debounced search (400ms) with race-condition prevention via request IDs
- ✅ Category filter (disabled during search — see decision below)
- ✅ Sorting by price, rating, title (client-side)
- ✅ Manual pagination with limit/skip, page size selector, page numbers
- ✅ URL state — page, limit, search, category, sort all in the URL
- ✅ Product detail page with image gallery and reviews
- ✅ Add product form with validation
- ✅ Edit product form pre-filled with existing data
- ✅ Delete with confirmation modal
- ✅ Loading skeletons, empty states, error states with retry
- ✅ Fully responsive (mobile cards, desktop table)
- ✅ Accessible (semantic HTML, ARIA labels, keyboard navigation, focus states)

## Authentication

**Login credentials:**
- Username: `emilys`
- Password: `emilyspass`

**Flow:**
1. POST `/auth/login` with credentials
2. `accessToken` stored in `localStorage` as `auth_token`
3. User object stored as `auth_user`
4. Axios interceptor attaches `Authorization: Bearer <token>` to every request
5. `AuthContext` rehydrates state from localStorage on mount
6. `AuthGuard` component wraps all protected pages and redirects to `/login` if unauthenticated

## API

All requests use the shared Axios instance in `lib/api/axios.ts`.

| Endpoint | Method | Purpose |
|---|---|---|
| `/auth/login` | POST | Authenticate user |
| `/products` | GET | List products (limit, skip) |
| `/products/search?q=` | GET | Search products |
| `/products/category/:slug` | GET | Filter by category |
| `/products/categories` | GET | Get all categories |
| `/products/:id` | GET | Get single product |
| `/products/add` | POST | Create product |
| `/products/:id` | PUT | Update product |
| `/products/:id` | DELETE | Delete product |

## Search

Search is debounced at **400ms** using the `useDebounce` hook. This prevents an API call on every keystroke.

**Race condition prevention:** A `latestRequestId` ref is incremented on every fetch. When a response arrives, it is discarded if its request ID does not match the current latest. This ensures that a slow earlier response can never overwrite a newer result, even when tested with `&delay=2000`.

## Pagination

Pagination uses DummyJSON's `limit` and `skip` parameters:

```
skip = (page - 1) * limit
```

The UI shows page numbers with ellipsis, previous/next buttons, a page size selector (10/20/50), and a "Showing X–Y of Z" summary. All values are validated — invalid URL params fall back to safe defaults (page=1, limit=20).

## URL State

The following values are stored in the URL query string:

| Param | Example | Default |
|---|---|---|
| `page` | `?page=2` | `1` |
| `limit` | `?limit=20` | `20` |
| `search` | `?search=phone` | `""` |
| `category` | `?category=smartphones` | `""` |
| `sort` | `?sort=price-asc` | `""` |

Invalid values (e.g. `?page=abc`, `?limit=hello`) are sanitized to safe defaults without crashing.

## Search + Category Limitation

**Decision: Option A — Category filter is disabled during search.**

DummyJSON does not support combining search (`/products/search?q=`) with category filtering in a single request. The two endpoints are separate.

**Why Option A:** It is the simplest, most honest approach. Fetching all search results and filtering client-side (Option B) would be unreliable because DummyJSON paginates search results — we would only filter the current page, not all matching products. Option A is transparent to the user (the category dropdown is visually disabled with a tooltip explaining why) and avoids misleading results.

## CRUD Limitation

DummyJSON **simulates** mutations but does **not permanently persist** them. After a page refresh, added/edited/deleted products will revert to the original API data.

The UI handles this gracefully:
- **Add:** The new product is navigated to immediately after creation (using the returned ID)
- **Edit:** The updated product is reflected in the detail page after save
- **Delete:** The item is removed from the local product list immediately using `removeProduct()` in the `useProducts` hook

A note is displayed on the add/edit forms informing users of this limitation.

## Challenges

**Challenge: Stale search responses overwriting newer results**

When a user types quickly, multiple API requests are in-flight simultaneously. A slow earlier request could resolve after a faster newer one, replacing the correct result with stale data.

**Solution:** A `latestRequestId` ref (integer) is incremented before every fetch. Each fetch captures its own ID. When the response arrives, it checks `if (requestId !== latestRequestId.current) return` — discarding any response that is no longer the most recent. This is simpler and more reliable than Axios `CancelToken` for this use case, though `CancelToken` is also used to clean up in-flight requests.

## AI Usage

- AI assisted in scaffolding boilerplate (form validation structure, skeleton components, pagination ellipsis logic)
- All architecture decisions (Axios interceptor design, race-condition strategy, search/category limitation choice, URL state management) were made and reviewed manually
- Every generated component was reviewed line-by-line and adjusted for correctness, accessibility, and consistency with the project's patterns
- The developer verified the implementation by testing all 49 scenarios listed in the requirements

## Setup

```bash
git clone <repo-url>
cd product-admin-dashboard
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```
NEXT_PUBLIC_API_BASE_URL=https://dummyjson.com
```

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Set `NEXT_PUBLIC_API_BASE_URL=https://dummyjson.com` in the Vercel project environment variables.

### Netlify

```bash
npm run build
# Deploy the .next folder using Netlify's Next.js adapter
```
