FROM itzg/minecraft-server:java25

LABEL org.opencontainers.image.title="Paper Minecraft Server"
LABEL org.opencontainers.image.description="Paper 1.21.11 hard survival server with LuckPerms, Grim, EssentialsX, ProtectionStones, and dependencies"

ENV EULA=TRUE \
    TYPE=PAPER \
    VERSION=1.21.11 \
    PAPER_CHANNEL=default \
    MODE=survival \
    DIFFICULTY=hard \
    SEED=888880777356331877 \
    LEVEL=world \
    MAX_PLAYERS=20 \
    MEMORY=4G \
    ENABLE_RCON=TRUE \
    OVERRIDE_SERVER_PROPERTIES=TRUE \
    MODRINTH_PROJECTS=@/extras/modrinth-projects.txt \
    MODRINTH_PROJECTS_DEFAULT_VERSION_TYPE=release \
    MODRINTH_DOWNLOAD_DEPENDENCIES=required \
    SPIGET_RESOURCES=57242,61797 \
    JVM_OPTS="-Dpaper.preferSparkPlugin=true"

COPY plugins/modrinth-projects.txt /extras/modrinth-projects.txt
