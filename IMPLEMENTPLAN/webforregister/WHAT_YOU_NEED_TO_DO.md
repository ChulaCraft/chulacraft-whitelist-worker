# What You Actually Need to Do

This is the owner checklist for the Chulacraft registration website.

You do **not** need to write the website, database migration, sync worker, or Docker integration yourself. Those are implementation tasks that can be completed in this repository. You only need to make the product decisions, configure accounts that only you can access, and provide the required environment values locally.

Do not paste passwords, Discord secrets, Supabase secret keys, or RCON passwords into chat.

## Current status

- [x] Minecraft Paper server exists and runs with Docker.
- [x] RCON is enabled and restricted to localhost.
- [x] A Supabase project already exists.
- [ ] The web application has not been created yet.
- [ ] The database schema has not been created yet.
- [ ] Discord OAuth has not been confirmed as configured.
- [ ] The local whitelist sync worker has not been created yet.
- [ ] Minecraft whitelist enforcement is currently disabled.
- [ ] Supabase variables are not currently present in the repository’s root `.env`.
- [ ] `.env.local` is not currently covered by `.gitignore`.

## Step 1 — Confirm these decisions

Tell the developer/Codex your answers. The recommended answer is shown for each item.

- [ ] Minecraft edition: **Java Edition only**.
- [ ] Registration rule: **one Discord account can register one Minecraft account**.
- [ ] Duplicate rule: **one Minecraft account cannot be registered by multiple Discord accounts**.
- [ ] Approval: **automatically whitelist every valid registration**.
- [ ] Discord membership: **allow any Discord account**, unless you want to require membership in your Discord server.
- [ ] Minecraft ownership: **check that the Minecraft account exists**, without proving ownership for the first version.
- [ ] Existing manual whitelist entries: **keep them**.
- [ ] Admin account `kaikub`: **keep it as a protected manual entry**.
- [ ] Website language: choose English, Thai, or both.
- [ ] Choose the public Minecraft address that the website should display.

If all recommended choices are acceptable, you can simply say:

> Use all recommended product decisions.

## Step 2 — Create a Discord application

1. Open the [Discord Developer Portal](https://discord.com/developers/applications).
2. Sign in with the Discord account that should own the application.
3. Select **New Application**.
4. Name it, for example, `Chulacraft`.
5. Open **OAuth2**.
6. Keep this page available; you will need the Client ID and Client Secret.

Do not send the Client Secret to anyone and do not add it to a public environment variable.

## Step 3 — Get the Supabase OAuth callback

1. Open your Supabase project.
2. Go to **Authentication → Sign In / Providers**.
3. Open the **Discord** provider.
4. Copy the callback URL displayed by Supabase.

It should look like:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

5. Return to the Discord Developer Portal.
6. In the application’s **OAuth2 → Redirects** section, add that exact Supabase callback URL.
7. Save the Discord changes.

Discord should receive the Supabase callback URL—not the website’s `/auth/callback` URL.

## Step 4 — Enable Discord in Supabase

1. In the Discord Developer Portal, copy the application’s Client ID.
2. Reveal and copy its Client Secret.
3. In Supabase, open **Authentication → Sign In / Providers → Discord**.
4. Enable the Discord provider.
5. Enter the Discord Client ID and Client Secret.
6. Save.

The Discord Client Secret stays in the Supabase Dashboard. It must not be placed in `NEXT_PUBLIC_...`, committed to Git, or sent to the browser.

## Step 5 — Configure Supabase website URLs

During local development:

1. Open **Authentication → URL Configuration** in Supabase.
2. Set or temporarily use this Site URL:

```text
http://localhost:3000
```

3. Add this Redirect URL:

```text
http://localhost:3000/auth/callback
```

After the website is deployed:

1. Change the Site URL to the real HTTPS website URL.
2. Add the production callback to the Redirect URLs.

Example:

```text
https://register.example.com/auth/callback
```

Keep the localhost callback in the allow list if local development will continue.

## Step 6 — Get the Supabase keys

Open the Supabase project’s **Connect** or **API Keys** page and copy:

1. Project URL.
2. Publishable key, usually beginning with `sb_publishable_`.
3. Backend secret key, usually beginning with `sb_secret_`.

If the project only shows legacy keys, the legacy `anon` key can replace the publishable key and the legacy `service_role` key can replace the secret key.

Key safety:

| Value | Where it may be used | Safe in browser? |
| --- | --- | --- |
| Project URL | Website and worker | Yes |
| Publishable/anon key | Website | Yes, with RLS enabled |
| Secret/service-role key | Local worker only | **No** |
| Discord Client Secret | Supabase Dashboard only | **No** |
| RCON password | Minecraft host/worker only | **No** |

## Step 7 — Prepare the local environment

Before creating `.env.local`, add these patterns to the root `.gitignore`:

```gitignore
.env.local
.env.*.local
```

The web application will need this file:

```text
IMPLEMENTPLAN/webforregister/.env.local
```

Its contents will be:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The local Minecraft sync worker will need these values in the root `.env`:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=sb_secret_REPLACE_ME
```

Keep the existing `RCON_PASSWORD` value. Do not replace it with the example text.

Important:

- `NEXT_PUBLIC_SUPABASE` by itself is not a complete variable.
- The exact public variables are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Never name the secret key `NEXT_PUBLIC_SUPABASE_SECRET_KEY`.
- Never commit either environment file.

## Step 8 — Choose where to host the website

Recommended choices are Vercel, Cloudflare, or another HTTPS-capable Next.js host.

You need to decide:

- [ ] Hosting provider.
- [ ] Production domain or provider URL.
- [ ] Whether to use a custom subdomain such as `register.yourdomain.com`.

The website host only receives:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
```

Do **not** add the following to Vercel or another public web host for this design:

- `RCON_PASSWORD`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Discord Client Secret

The local worker on the Minecraft PC holds the privileged keys and talks to RCON privately.

## Step 9 — Ask for implementation

After completing or confirming Steps 1–8, ask the developer/Codex to implement the PRD.

You can use this request:

> Implement `IMPLEMENTPLAN/webforregister/PRD.md`. Use the decisions in `WHAT_YOU_NEED_TO_DO.md`. Build the Next.js site, Supabase migration, local whitelist worker, Docker Compose integration, tests, and setup documentation. Do not expose or commit secrets.

You do not need to send the secret values. Put them in the correct local files yourself when the implementation tells you the files are ready.

## Step 10 — Run the Supabase migration

This happens after the database migration file has been implemented.

You will need to do one of these:

- run the migration using the Supabase CLI while linked to your project; or
- copy the reviewed migration into the Supabase SQL Editor and run it once.

Before public launch, verify:

- [ ] The `minecraft_registrations` table exists.
- [ ] Row Level Security is enabled.
- [ ] Anonymous users cannot read registrations.
- [ ] One authenticated player cannot read another player’s registration.
- [ ] Browser users cannot update whitelist synchronization fields.

Do not create a public table without RLS.

## Step 11 — Start the completed local stack

This happens after the worker and Compose changes have been implemented.

From the repository root:

```powershell
docker compose up -d --build
```

Then inspect the services:

```powershell
docker compose ps
docker compose logs -f minecraft
```

The final Compose setup should:

- enable the Minecraft whitelist;
- enforce the whitelist;
- start the local sync worker;
- wait for RCON to become ready;
- import every desired Supabase registration;
- keep checking for new registrations;
- keep RCON private.

Never forward or publicly expose port `25575`.

## Step 12 — Test locally

Use a Discord account and a real Minecraft Java Edition profile.

- [ ] Open `http://localhost:3000`.
- [ ] Sign in with Discord.
- [ ] Submit the Minecraft username.
- [ ] Confirm the website first shows a waiting state.
- [ ] Confirm a row appears in Supabase.
- [ ] Confirm the state changes to whitelisted.
- [ ] Confirm the account can join Minecraft.
- [ ] Confirm an unregistered account cannot join.
- [ ] Submit the form again and confirm no duplicate row is created.

Also test recovery:

1. Stop the Minecraft service.
2. Register a different test account.
3. Confirm the registration remains saved but waiting/failed.
4. Start the Minecraft service.
5. Confirm the worker automatically adds the account.

## Step 13 — Deploy the website

After local tests pass:

1. Deploy the Next.js application to your selected host.
2. Add the three public environment values to the hosting provider.
3. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS URL.
4. Add the production `/auth/callback` URL to Supabase’s redirect allow list.
5. Set Supabase’s Site URL to the final production URL.
6. Test Discord sign-in from the production site.

Do not deploy the local sync worker to Vercel. It belongs on the same PC/private Docker network as Minecraft.

## Step 14 — Final launch test

- [ ] A new player can sign in using Discord.
- [ ] A valid Minecraft username creates one database registration.
- [ ] The live server receives the whitelist entry.
- [ ] The website confirms success only after the server confirms it.
- [ ] The player can join.
- [ ] An unregistered player is rejected.
- [ ] Restarting Docker restores every desired database player to the whitelist.
- [ ] Manual/protected entry `kaikub` remains available.
- [ ] No Supabase secret, Discord secret, OAuth token, or RCON password appears in the browser or logs.
- [ ] Only Minecraft TCP port `25565` is forwarded publicly.

## What you do not need to do

You do not need to:

- manually add every registered player with an RCON command;
- manually edit `data/whitelist.json`;
- expose RCON to the Internet;
- put a Supabase secret key in the website;
- give Codex your secret values;
- manually re-add database players after each server restart;
- write the Next.js, SQL, worker, or Docker code yourself.

## Information you can safely send back

You can safely provide:

- whether all recommended decisions are accepted;
- the chosen website language;
- the planned public website URL;
- the public Minecraft server address;
- whether Discord server membership is required;
- whether `kaikub` should remain protected;
- confirmation that Discord and Supabase have been configured;
- confirmation that local environment values have been added.

Do not send the actual Client Secret, Supabase secret key, RCON password, access tokens, or environment file contents.

## Ready-for-implementation checkpoint

Development can begin when these boxes are checked:

- [ ] Product decisions are confirmed.
- [ ] Discord application exists.
- [ ] Discord callback is configured.
- [ ] Discord provider is enabled in Supabase.
- [ ] Local Supabase redirect URL is allowed.
- [ ] Project URL and keys are available locally.
- [ ] Website hosting choice is known, or localhost-only development is acceptable first.

