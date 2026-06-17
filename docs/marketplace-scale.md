# Marketplace at Scale (100+ Products)

Design the catalog API and UI now so adding products 3–100+ never requires a rework.

## Problem

With 2 products, a flat list works. With 100+:

- UI must not render all cards at once
- API must paginate and support search/filter
- Dashboard shows **subscribed only** (small set); marketplace shows **full catalog** (large set)

## Data model (`platform-subscriptions`)

```text
Product
  id, slug, name, shortDescription, longDescription
  iconUrl, coverUrl
  categoryId, tags[]
  status: draft | published | deprecated
  featured: boolean
  sortOrder: int
  launchUrl: string          # e.g. https://education.mydata.platform
  createdAt, updatedAt

Category
  id, slug, name, sortOrder

UserSubscription
  userId, productSlug, status, activatedAt
```

Seed 10 products in Phase 0 to stress-test grid + search UI.

## API — built for scale from day one

### `GET /v1/products` (marketplace catalog)

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Full-text search (name, description, tags) |
| `category` | string | Category slug |
| `tag` | string | Tag filter |
| `featured` | boolean | Featured row only |
| `subscribed` | boolean | Filter by user's subscription state |
| `cursor` | string | Opaque pagination cursor |
| `limit` | int | Default 24, max 48 |

**Response:**

```json
{
  "items": [
    {
      "slug": "education",
      "name": "Education",
      "shortDescription": "Institutes, classes, assignments",
      "iconUrl": "/icons/education.svg",
      "category": "learning",
      "tags": ["schools", "teachers"],
      "featured": true,
      "subscribed": true,
      "launchUrl": "https://education.mydata.platform"
    }
  ],
  "nextCursor": "eyJ...",
  "totalApprox": 124
}
```

### `GET /v1/users/me/subscriptions`

Returns subscribed products only (dashboard). Typically < 20 items — **no pagination needed** on dashboard.

### `GET /v1/products/categories`

Category list with product counts for filter chips.

## Search implementation

| Phase | Approach |
|-------|----------|
| MVP (≤ 50 products) | PostgreSQL `ILIKE` + `tsvector` on name/description |
| Scale (100+) | Same for MVP; add Meilisearch/Typesense in Phase 5 if needed |

Index now:

```sql
CREATE INDEX idx_products_search ON products
  USING gin(to_tsvector('english', name || ' ' || short_description));
```

## Caching

- Product catalog changes infrequently → **Redis cache** 5–15 min TTL
- Invalidate on `product.updated` admin event (future)
- User subscriptions cache per user 1–5 min

## Frontend — marketplace UI

| Technique | Library | Why |
|-----------|---------|-----|
| Virtualized grid | `@tanstack/react-virtual` | Render ~20 visible cards, not 100+ |
| Search debounce | 300ms | Avoid API spam |
| URL state | `?q=&category=` | Shareable, back button works |
| Infinite scroll | cursor + `useInfiniteQuery` | Smooth browsing |
| Responsive grid | CSS grid `minmax(260px, 1fr)` | 1–4 columns |

### Page structure (100+ products)

```
Marketplace
├── Sticky search + category chips
├── Featured row (horizontal scroll, max 8)
├── Category sections (optional, Phase 2)
└── All products (virtualized grid + infinite scroll)
```

### Dashboard vs marketplace

| Surface | Data source | Max items | UI |
|---------|-------------|-----------|-----|
| Dashboard | `/users/me/subscriptions` | ~20 | Simple grid, no virtualization |
| Marketplace | `/products?cursor=` | 100+ | Virtualized + search |

## Product onboarding (future)

Adding product #101 = database row + icon asset + `launchUrl`. No platform redeploy.

Admin API (Phase 5): `POST /v1/admin/products` — not MVP.

## Phase 0 / Phase 1 tasks

| Phase | Task |
|-------|------|
| 0 | Product + Category schema in OpenAPI stub |
| 0 | Seed 10 products in Docker seed script |
| 1 | Paginated `GET /products` with `q` + `category` |
| 1 | Marketplace UI: search, chips, virtualized grid |
| 1 | Dashboard: subscribed cards only, link to marketplace |

## Anti-patterns

- Hardcoded product array in frontend
- Loading all products in one API call
- Rendering full grid without virtualization
- Putting marketplace and dashboard in different design systems
