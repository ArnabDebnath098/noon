# storage

Separate data/asset storage layer for the noon app.

- `products/images/` — product image files served by the backend at `/storage/products/images/...`
- `uploads/` — user/admin uploads

Keep large binaries out of git in production (use object storage / S3). The
backend serves this directory statically via `STORAGE_DIR`.
