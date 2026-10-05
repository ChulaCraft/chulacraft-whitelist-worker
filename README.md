# ChulaCraft Whitelist Worker

Applies the desired whitelist state stored in Supabase (`minecraft_registrations`,
written by [chulacraft-web](https://github.com/ChulaCraft/chulacraft-web)) to the
Paper server over private RCON.

- On startup, reconciles every registration (up to 1000 each way).
- Then polls every `POLL_INTERVAL_MS` for due `pending`/`failed` additions and
  unprocessed removals, retrying failures with exponential backoff (max 5 min).
- On removal (revoke, ban, account deletion) it also kicks the player if online.
- Only touches accounts it knows from the database; manual whitelist entries are
  left alone.
- Writes a heartbeat to `/run/whitelist-worker/heartbeat`; `healthcheck.cjs`
  fails if it is older than 45 s.

## Configuration

| Variable | Required | Default |
| --- | --- | --- |
| `SUPABASE_URL` | yes | |
| `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) | yes | |
| `RCON_PASSWORD` | yes | |
| `RCON_HOST` | no | `minecraft` |
| `RCON_PORT` | no | `25575` |
| `POLL_INTERVAL_MS` | no | `8000` |

Never expose RCON outside the host/Docker network, and never give the website
the secret key or RCON password.

## Run

The `main` branch publishes `ghcr.io/chulacraft/whitelist-worker:latest` (and
`:sha-<commit>`). The package is private, so the host needs
`docker login ghcr.io` with a token that has `read:packages`.

```yaml
services:
  whitelist-sync:
    image: ghcr.io/chulacraft/whitelist-worker:latest
    restart: unless-stopped
    env_file: whitelist-worker.env
    depends_on: [minecraft]
```

Local:

```bash
npm ci
npm run check
npm test
SUPABASE_URL=... SUPABASE_SECRET_KEY=... RCON_PASSWORD=... RCON_HOST=127.0.0.1 npm start
```
