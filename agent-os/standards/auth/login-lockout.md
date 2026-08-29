# Login Lockout

Login is locked in Nest memory after 5 failures for the same normalized email in 15 minutes. The next attempt is HTTP 429 `{ code: 'TOO_MANY_ATTEMPTS' }` until the window ends.

- Missing users still run `bcrypt.compare` against `DUMMY_PASSWORD_HASH` so miss vs mismatch is not a cheap timing oracle.
- A successful login clears that email’s counter.
- The frontend login screen already treats HTTP 429 as lockout copy. Do not add a second lockout UI.
- In-memory is enough for the single Nest replica in Compose. It resets on process restart.
