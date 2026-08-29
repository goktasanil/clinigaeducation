# Trendyol automation adapter

This adapter installs the reviewed `trendyol-sdk` commit and the `n8n-nodes-trendyol` package.
Its executable surface exposes product and order reads only, defaults to Trendyol stage, and refuses
to start when `TRENDYOL_ALLOW_WRITES=true`.

```bash
npm ci
npm test
npm run status
npm run products
```

The n8n community node is installed for isolated workflow development, but it is not automatically
loaded into a production n8n instance and no credentials are copied into this repository.
