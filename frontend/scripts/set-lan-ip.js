const fs = require("fs");
const os = require("os");
const path = require("path");

const PORT = 5000;
const ENV_PATH = path.join(__dirname, "..", ".env");

function getLanIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs || []) {
      if (addr.family !== "IPv4" || addr.internal) continue;
      if (addr.address.startsWith("169.254.")) continue; // link-local, no real network
      candidates.push({ name, address: addr.address });
    }
  }

  // Prefer an adapter named like Wi-Fi/wlan over Ethernet/vEthernet/virtual adapters
  const wifi = candidates.find((c) => /wi-?fi|wlan/i.test(c.name));
  return (wifi || candidates[0])?.address;
}

const ip = getLanIp();
if (!ip) {
  console.warn("⚠️  Could not detect a LAN IP; leaving .env untouched.");
  process.exit(0);
}

let env = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf8") : "";
const line = `EXPO_PUBLIC_API_HOST=http://${ip}:${PORT}`;

if (/^EXPO_PUBLIC_API_HOST=.*$/m.test(env)) {
  env = env.replace(/^EXPO_PUBLIC_API_HOST=.*$/m, line);
} else {
  env += (env.endsWith("\n") || env === "" ? "" : "\n") + line + "\n";
}

fs.writeFileSync(ENV_PATH, env);
console.log(`✔ EXPO_PUBLIC_API_HOST set to http://${ip}:${PORT}`);
