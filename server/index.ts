import { createApi } from "./api.js";
import { Store } from "./cache.js";
const port = Number(process.env.PORT || 4317);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("Invalid port");
const server = createApi(new Store(process.env.DATA_DIR || "./data/local"));
server.listen(port, "127.0.0.1", () =>
  console.log("Portfolio API ready on loopback"),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
