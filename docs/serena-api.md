# Serena API V1

This project exposes a small management API under `/api/serena/*` so a remote Serena workspace can operate the site without using the human admin UI directly.

The current V1 contract is intentionally small and reusable across similar Next.js + Payload CMS websites.

## Authentication

All Serena routes expect one of these headers:

- `Authorization: Bearer <SERENA_API_SECRET>`
- `x-serena-secret: <SERENA_API_SECRET>`

Optional IP allowlisting can be enabled with `SERENA_ALLOWED_IPS`.

## Environment Variables

- `SERENA_API_SECRET`
- `SERENA_ALLOWED_IPS`

## Endpoints

### `GET /api/serena/auth/verify`

Checks whether the provided Serena credentials are valid.

Response:

```json
{
  "ok": true,
  "authenticated": true,
  "clientIp": "34.143.206.68",
  "scope": ["auth:verify", "status:read", "pages:write", "revalidate:write"]
}
```

### `GET /api/serena/status`

Returns the management capabilities and basic site status.

Response:

```json
{
  "ok": true,
  "service": "serena-v1",
  "scope": ["auth:verify", "status:read", "pages:write", "revalidate:write"],
  "serverUrl": "http://34.124.244.233/template",
  "basePath": "/template",
  "environment": "production",
  "collections": {
    "pages": {
      "total": 12
    }
  },
  "features": {
    "pageUpsert": true,
    "revalidate": true
  }
}
```

### `POST /api/serena/pages/upsert`

Creates or updates a Payload `pages` document by `id` or `slug`.

Request:

```json
{
  "title": "About Serena",
  "slug": "about-serena",
  "status": "draft",
  "hero": {
    "type": "lowImpact"
  },
  "layout": [],
  "meta": {
    "title": "About Serena",
    "description": "Serena draft page"
  }
}
```

Notes:

- If `id` is provided, it updates that page.
- If `slug` is provided and exists, it updates that page.
- If nothing exists, it creates a new page.
- If `hero` is omitted for a new page, the API defaults it to `{ "type": "lowImpact" }`.
- If `layout` is omitted for a new page, the API defaults it to `[]`.

### `POST /api/serena/revalidate`

Triggers Next.js cache revalidation for a path, slug, or tag.

Request examples:

```json
{ "slug": "about-serena" }
```

```json
{ "path": "/about-serena" }
```

```json
{ "tag": "pages-sitemap" }
```

### `POST /api/serena/posts/upsert`

Creates or updates a Payload `posts` document by `id` or `slug`.

Request:

```json
{
  "title": "Yesterday blog draft",
  "slug": "yesterday-blog-draft",
  "status": "draft",
  "meta": {
    "title": "Yesterday blog draft",
    "description": "Draft blog post created by Serena"
  }
}
```

If `content` is omitted, the API creates a minimal valid rich-text body automatically.

### `POST /api/serena/globals/update`

Updates a supported Payload global.

Currently supported globals:

- `header`
- `footer`
- `settings`

Request:

```json
{
  "global": "settings",
  "data": {
    "contactEmail": "hello@example.com"
  }
}
```

### `POST /api/serena/media/upload`

Uploads an asset into the `media` collection using multipart form data.

Form fields:

- `file` - required
- `alt` - optional
- `folder` - optional

Example:

```bash
curl -X POST "$BASE_URL/api/serena/media/upload" \
  -H "Authorization: Bearer $SERENA_API_SECRET" \
  -F "file=@./hero.jpg" \
  -F "alt=Homepage hero"
```

## Intended Evolution

The next reusable endpoints for other Serena-managed sites should likely be:

- `/api/serena/publish`
- `/api/serena/content/search`

This keeps the contract stable across sites while allowing each project to expose only the content domains it actually supports.
