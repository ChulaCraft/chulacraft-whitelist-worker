// Stub PostgREST endpoint and game port used by the end-to-end tests.
const http = require("node:http");
const net = require("node:net");

function makeRow(overrides) {
  return Object.assign(
    {
      id: "11111111-1111-1111-1111-111111111111",
      minecraft_username: "PlayerOne",
      desired_whitelisted: true,
      sync_status: "pending",
      sync_attempts: 0,
      next_sync_at: new Date(Date.now() - 60000).toISOString(),
      revoked_at: null
    },
    overrides || {}
  );
}

// Returns one GET page of rows, then echoes PATCH updates back as a 1-row select.
function startSupabase(rows) {
  const updates = [];
  let patched = 0;
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      res.setHeader("Content-Type", "application/json");
      if (req.method === "GET") {
        // The polling pass adds .lte("next_sync_at", due) to both queries. Honor
        // it so a record left due by a deferral is offered again next pass.
        const dueOnly = req.url.includes("next_sync_at=lte");
        const isRemoval = req.url.includes("revoked_at=is.null");
        const due = rows.filter((r) => (isRemoval ? r.desired_whitelisted === false : r.desired_whitelisted === true));
        const selected = dueOnly ? due.filter((r) => Date.parse(r.next_sync_at) <= Date.now()) : due;
        return res.end(JSON.stringify(selected));
      }
      // Echo the update back as a 1-row select, and push next_sync_at forward on
      // success so a synced record is not offered again on later passes.
      if (req.method === "PATCH") {
        const change = body ? JSON.parse(body) : {};
        patched += 1;
        updates.push(change);
        if (rows[0]) {
          Object.assign(rows[0], change);
          if (change.sync_status === "synced") rows[0].next_sync_at = new Date(Date.now() + 3_600_000).toISOString();
        }
        return res.end(JSON.stringify([Object.assign({ id: rows[0].id }, change)]));
      }
      res.end("[]");
    });
  });
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () =>
      resolve({
        updates,
        get patchCount() {
          return patched;
        },
        url: "http://127.0.0.1:" + server.address().port,
        close: () => server.close()
      })
    )
  );
}

// Stands in for the Minecraft game port, which the stdin transport probes to
// tell a running server from a stopped one.
function startGamePort() {
  const server = net.createServer((socket) => socket.destroy());
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve({ port: String(server.address().port), close: () => server.close() }))
  );
}

module.exports = { makeRow, startGamePort, startSupabase };