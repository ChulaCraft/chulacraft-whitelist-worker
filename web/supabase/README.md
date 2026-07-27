# Supabase verification

Apply the migration before exercising the web API. In an approved test project, verify these database cases with two authenticated sessions:

- Two simultaneous calls to `register_minecraft_profile` by the same Discord user and Minecraft UUID return one `created=true` row and one `created=false` row.
- A different user racing for that UUID gets only `REGISTRATION_CONFLICT` and no owner information.
- A player cannot select another player’s row or write worker fields. Their explicit browser query may select only `minecraft_username`, `desired_whitelisted`, `sync_status`, and `updated_at`; `select *` and internal retry/error/Discord fields must be denied.
- Changing `desired_whitelisted` to false resets the row to due/pending with `revoked_at=null`; changing it back to true resets it to due/pending for an add.
- `consume_registration_attempt()` permits five authenticated attempts in ten minutes, derives the caller from `auth.uid()`, and cannot be read or modified directly by browser roles.

The API also keeps a best-effort in-process IP bucket based on `X-Forwarded-For`. Configure the hosting platform as the trusted proxy boundary; direct or misconfigured proxies can spoof this header, so it is not the authoritative limit.

These require a real Supabase Auth schema and are therefore deployment smoke/database tests, rather than unit tests that could run without a Supabase project.
