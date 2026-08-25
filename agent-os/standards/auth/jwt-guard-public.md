# JWT Guard and @Public

`JwtAuthGuard` is a global `APP_GUARD`. New endpoints are authenticated unless marked `@Public()`.

```ts
@Public()
@Get('config')
config(): ApiResponse<AuthConfigDto> { ... }

@Get('me')
me(@CurrentUser() user: User): ApiResponse<AuthSessionData> { ... }
```

- Read the access cookie in the guard only. Controllers use `@CurrentUser()`, not `req.cookies`.
- Guard verifies JWT, loads `User` from Prisma, sets `request.user`. Missing/invalid → `UNAUTHORIZED` 401.
- `@Public()` today: `/health`, `/health/ready`, and unauthenticated auth actions (register, login, logout, refresh, verify, resend, forgot, reset, config). Not `GET /auth/me` or change-password.
- Practice APIs stay guarded. Do not make a practice route public to “simplify” the client.
