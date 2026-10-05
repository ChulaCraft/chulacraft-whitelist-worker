# ChulaCraft Whitelist Worker

Applies the desired whitelist state stored in Supabase (`minecraft_registrations`,
written by [chulacraft-web](https://github.com/ChulaCraft/chulacraft-web)) to the
Paper/Folia server, through the systemd instance's stdin socket.

- Reads the server's own `/srv/minecraft/instances/<instance>/whitelist.json`
  and sends a command only where it disagrees with the database. A restart
  therefore sends nothing when everything is already in sync.
- On startup, reconciles every registration (up to 1000 each way) against that
  file; then polls every `POLL_INTERVAL_MS` for due `pending`/`failed` additions
  and unprocessed removals, retrying failures with exponential backoff (max 5 min).
- On removal (revoke, ban, account deletion) it also kicks the player.
- Only touches accounts it knows from the database; manual whitelist entries are
  left alone.

Commands go to `/run/minecraft/<instance>.stdin`. Stdin gives no reply, and
systemd keeps that FIFO open while the server is stopped, so the worker first
checks the instance's `server-port` (from its `server.properties`) accepts
connections. If not, it logs `sync_deferred` and leaves the record due without
counting an attempt: a down server is not a per-player error.

## Configuration

| Variable | Required | Default |
| --- | --- | --- |
| `SUPABASE_URL` | yes | |
| `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) | yes | |
| `POLL_INTERVAL_MS` | no | `8000` |
| `MINECRAFT_RUN_DIR` | tests only | `/run/minecraft` |
| `MINECRAFT_INSTANCES_DIR` | tests only | `/srv/minecraft/instances` |

| Flag | Default | |
| --- | --- | --- |
| `--server-name` | `chulacraft` | Server instance: picks the stdin socket and instance directory. |

Never give the website the secret key.

## Run

Run exactly one worker per server instance, as the
`whitelist-worker@<instance>.service` template unit in
[chulacraft-minecraft](https://github.com/ChulaCraft/chulacraft-minecraft).
It reads `/srv/minecraft/workers/<instance>/whitelist/.env`; logs go to the
journal (`journalctl -u whitelist-worker@<instance>`).

### Local

```bash
npm ci
npm run check
npm test
```
