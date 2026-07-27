# Docker Paper Minecraft Server

This setup runs a Paper `1.21.11` survival server on hard difficulty with seed `888880777356331877`.
It uses Java 25 because the current WorldEdit/WorldGuard builds for this server version require it.

I chose `1.21.11` instead of the newest Paper `26.2` because ProtectionStones is the limiting plugin. Most of the named plugins already support newer Minecraft releases, but ProtectionStones currently advertises `1.21.10+`/`1.21.10-1.21.11` support and has a visible compatibility gap for `26.x`.

## Included Plugins

- LuckPerms
- spark
- Grim Anticheat
- EssentialsX
- ProtectionStones
- WorldEdit
- WorldGuard
- VaultUnlocked
- PlaceholderAPI

ProtectionStones and spark are downloaded through Spiget resource IDs in the Dockerfile. The rest are downloaded from Modrinth using `plugins/modrinth-projects.txt`.

The Compose file maps the Minecraft server to host port `25566` by default because another local container may already be using `25565`. Players can connect to `localhost:25566` or `your-server-ip:25566`.

## Run

```bash
docker compose up -d --build
```

Watch startup logs:

```bash
docker compose logs -f minecraft
```

Make yourself operator after the server is running:

```bash
docker compose exec minecraft rcon-cli op YourMinecraftName
```

Stop the server:

```bash
docker compose down
```

The world, server files, and plugin config are stored in `./data`.

## Useful Overrides

Create a `.env` file if you want to change runtime settings:

```env
MEMORY=6G
MAX_PLAYERS=20
RCON_PASSWORD=change-this-password
MOTD=Hard Survival
TZ=Asia/Bangkok
MINECRAFT_PORT=25566
```

Do not upgrade `VERSION` to `26.2` unless you also replace or remove ProtectionStones.
# Chulacraft
