# Chulacraft registration runbook

## Safe launch order

1. Run `supabase/migrations/202607270001_minecraft_registrations.sql` in the intended Supabase project and verify RLS with two test users.
2. Configure Supabase Discord OAuth. In Discord, use only the exact provider callback `https://xtqpulleqbvoroxzheor.supabase.co/auth/v1/callback`. In Supabase URL Configuration, set Site URL to `https://mc.ratchaphon.com` and allow both `http://localhost:3000/auth/callback` and `https://mc.ratchaphon.com/auth/callback`. During domain migration, the old Vercel callback may remain temporarily. The app intentionally uses the path-only callback so the allowlist does not depend on query parameters.
3. Set only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL` on the web host.
4. On the Minecraft host, create `minecraft/.env` from its example with `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and the existing `RCON_PASSWORD`. Never place these backend secrets on the web host.
5. Start with `docker compose -f minecraft/compose.yaml up -d --build`. Whitelist enforcement is enabled by this stack, so do not turn it on before the migration and worker secrets are ready.
6. Deploy the web application over HTTPS, update the Supabase Site URL/redirect allow list, then perform one real Discord/Minecraft registration test.

## Normal operations

- Inspect service health with `docker compose -f minecraft/compose.yaml ps` and worker logs with `docker compose -f minecraft/compose.yaml logs -f whitelist-sync`.
- Back up the Supabase project/database and `minecraft/data/` (world, Paper configuration, and manual whitelist entries). Do not edit `data/whitelist.json` while Paper is running.
- On restart, the worker reconciles all desired registrations. A `synced` record can therefore be restored after a world/container rebuild without manual RCON commands.
- To revoke a player, set their known database record to `desired_whitelisted=false`. The worker removes only that known username; it does not remove manual entries such as `kaikub`.

## Troubleshooting and recovery

| Symptom | Check and recovery |
| --- | --- |
| Registration stays pending/failed | Check `whitelist-sync` logs and its health; it retries automatically with capped backoff. Confirm the Minecraft service is healthy and RCON remains internal. |
| `SUPABASE_ERROR` in worker logs | Verify the URL and backend secret on the Minecraft host, Supabase availability, and RLS/migration state. Do not log or paste the secret. |
| `RCON_OFFLINE` or `RCON_TIMEOUT` | Check `minecraft` logs and Docker health, then restart the affected service. The durable Supabase row is retried after recovery. |
| Player cannot sign in | Confirm the Discord provider, Supabase Site URL, and allowed callback URL match the deployed HTTPS web URL exactly. |
| Registration attempts are unexpectedly limited | Check the caller's `registration_attempt_windows` row through the operator database access. The durable limit is five attempts per authenticated user in ten minutes; the IP limit additionally relies on the deployment proxy correctly setting `X-Forwarded-For`. |
| Need to roll back web deployment | Redeploy the last known-good web build; registration records remain safe in Supabase. Do not roll back the database migration without a reviewed data plan. |

## Secret incident response

If a Supabase backend key, Discord secret, or RCON password may have been exposed, rotate it immediately in its owning service, update only the relevant private environment, redeploy/restart that service, and review normal logs for accidental disclosure. RCON must never be forwarded publicly; only Minecraft TCP `25565` should be exposed.
