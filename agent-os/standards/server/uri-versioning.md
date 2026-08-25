# URI Versioning

Nest sets global prefix `api` and URI version `1`. Controllers omit both — a `@Controller('exercises')` is `/api/v1/exercises`.

```ts
app.setGlobalPrefix('api')
app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
```

- Frontend `apiFetch` / `aiFetch` prefix `/api/v1`. Do not hard-code host paths without that prefix.
- Swagger UI is `/api/docs` (unversioned).
- There is no v2 policy yet. Stay on v1; do not introduce `/api/v2` until that decision exists.
- Path versioning is there so a future breaking `/api/v2` can coexist without renaming every current route.
