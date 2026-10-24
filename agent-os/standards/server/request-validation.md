# Request Validation

Global `ValidationPipe` is `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`. Unknown body/query keys are HTTP 400.

```ts
export class CreateExerciseDto {
  @IsIn(SKILLS)
  skill!: Skill

  @IsObject()
  payload!: Record<string, unknown>
}
```

- Put request classes in the feature `dto/` folder. Use class-validator. Do not add a second validation library.
- Shared request shapes live in `@exam-one/contracts`; Nest DTOs enforce them at the boundary.
- Do not pass `@Body()` / `@Query()` through as `unknown` and validate in the service.
- Invalid body is HTTP 400 (pipe). Domain failures still throw coded exceptions (`INVALID_PAYLOAD`, …).
