export const MINECRAFT_USERNAME_PATTERN = /^[A-Za-z0-9_]{3,16}$/;

export type SyncStatus = "pending" | "synced" | "failed";

export type RegistrationView = {
  minecraftUsername: string;
  desiredWhitelisted: boolean;
  syncStatus: SyncStatus;
  updatedAt: string;
};

export function normalizeMinecraftUsername(value: string) {
  return value.trim();
}

export function isValidMinecraftUsername(value: string) {
  return MINECRAFT_USERNAME_PATTERN.test(normalizeMinecraftUsername(value));
}

export function statusMessage(registration: Pick<RegistrationView, "desiredWhitelisted" | "syncStatus">) {
  if (!registration.desiredWhitelisted) {
    return "This registration is no longer active. Contact an admin.";
  }
  if (registration.syncStatus === "synced") {
    return "You are whitelisted. You can join the server.";
  }
  if (registration.syncStatus === "failed") {
    return "Registration saved, but the server could not be updated yet. We’ll retry automatically.";
  }
  return "Registration saved. Waiting for the Minecraft server.";
}

export function safeNextPath(value: string | null) {
  const hasControlCharacter = value ? Array.from(value).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127) : false;
  return value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !hasControlCharacter ? value : "/register";
}
