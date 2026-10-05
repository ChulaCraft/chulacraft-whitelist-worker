# ChulaCraft Whitelist Worker

Applies the desired whitelist state stored in Supabase (`minecraft_registrations`,
written by [chulacraft-web](https://github.com/ChulaCraft/chulacraft-web)) to the
Paper/Folia server.

- On startup, reconciles every registration (up to 1000 each way).
- Then polls every `POLL_INTERVAL_MS` for due `pending`/`failed` additions and
  unprocessed removals, retrying failures with exponential backoff (max 5 min).
- On removal (revoke, ban, account deletion) it also kicks the player if online.
- Only touches accounts it knows from the database; manual whitelist entries are
  left alone.

## Transports

The worker speaks to the server over whichever of these is available, chosen per
command so it survives the server restarting underneath it:

1. **Systemd stdin socket** (`/run/minecraft/<instance>.stdin`) — preferred. No
   password, no exposed port. Selected when that socket exists; pass
   `--server-name <instance>`. Stdin gives no reply, and systemd keeps the
   socket open while the server is stopped, so the worker only writes once the
   game port (`MINECRAFT_PORT`) accepts connections; until then records are
   deferred.
2. **RCON over TCP** — the fallback, used by Docker and by instances with no
   stdin socket. Each command opens its own short-lived session so a broken
   socket cannot poison the next poll.

`worker_started` logs which transport is active. If the server is unreachable the
worker logs `sync_deferred` and leaves the record due. It deliberately does not
count that as a failed attempt: a down server is not a per-player error, and
charging it against `sync_attempts` would park the entire queue outside the
retry window.

## Configuration

| Variable | Required | Default |
| --- | --- | --- |
| `SUPABASE_URL` | yes | |
| `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) | yes | |
| `POLL_INTERVAL_MS` | no | `8000` |
| `MINECRAFT_RUN_DIR` | no | `/run/minecraft` |
| `MINECRAFT_PORT` | stdin only | `25565` |
| `RCON_PASSWORD` | RCON only | |
| `RCON_HOST` | no | `127.0.0.1` |
| `RCON_PORT` | no | `25575` |

| Flag | Default | |
| --- | --- | --- |
| `--server-name` | `chulacraft` | Server instance, used for the stdin socket path. |
| `--heartbeat-file` | `/run/whitelist-worker/heartbeat` | Liveness marker for the container `HEALTHCHECK`. |

Never expose RCON outside the host/Docker network, and never give the website
the secret key or RCON password.

Note that Paper/Folia silently disables RCON when `rcon.password` is empty, so
`RCON_PASSWORD` must match a non-empty `rcon.password` in `server.properties`.

## Run

### Docker

The `main` branch publishes `ghcr.io/chulacraft/whitelist-worker:latest` (and
`:sha-<commit>`). The package is private, so the host needs `docker login
ghcr.io` with a token that has `read:packages`.

```yaml
services:
  whitelist-sync:
    image: ghcr.io/chulacraft/whitelist-worker:latest
    restart: unless-stopped
    env_file: whitelist-worker.env
    depends_on: [minecraft]
```

### systemd

Run exactly one worker per server instance. A template unit lives in
[chulacraft-minecraft](https://github.com/ChulaCraft/chulacraft-minecraft) as
`system-config/whitelist-worker@.service`; the worker reads
`/srv/minecraft/workers/<instance>/whitelist/.env`.

### Local

```bash
npm ci
npm run check
npm test
SUPABASE_URL=... SUPABASE_SECRET_KEY=... RCON_PASSWORD=... RCON_HOST=127.0.0.1 npm start
```