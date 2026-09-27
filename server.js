const { createServer } = require("http");
const next = require("next");

const port = Number(process.env.PORT || 3000);
const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, "0.0.0.0", () => {
    console.log(`HKBOARDWAR frontend listening on port ${port}`);
  });
});
