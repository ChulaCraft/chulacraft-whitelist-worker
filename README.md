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

The Compose file maps the Minecraft server to the standard host port `25565`. `kaikub` is made an operator automatically at startup. Players on the local network can connect to `192.168.100.7:25565`.

## Run

```bash
docker compose up -d --build
```

Watch startup logs:

```bash
docker compose logs -f minecraft
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
MINECRAFT_PORT=25565
OPS=kaikub
```

Do not upgrade `VERSION` to `26.2` unless you also replace or remove ProtectionStones.

## Playing With Friends

The host LAN address is currently `192.168.100.7`. Docker exposes TCP port `25565` on this host. To accept Internet connections, allow the same port in Windows Firewall from an elevated PowerShell:

```powershell
New-NetFirewallRule -DisplayName "Chulacraft Minecraft TCP 25565" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 25565 -Profile Private
```

Then create this TCP forwarding rule in the router (UPnP was not available on this network):

```text
Protocol: TCP
External port: 25565
Internal address: 192.168.100.7
Internal port: 25565
```

Your friend connects using your public IP address and port `25565`. Keep the PC and Docker Desktop running while testing. A router DHCP reservation for `192.168.100.7` prevents this forwarding rule from breaking after an address change.
# Chulacraft
