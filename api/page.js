const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  // Try multiple possible paths where Vercel might place the file
  const paths = [
    path.join(__dirname, "..", "index.html"),
    path.join(process.cwd(), "index.html"),
    path.resolve("index.html"),
    path.join(__dirname, "index.html"),
  ];

  for (const p of paths) {
    try {
      const html = fs.readFileSync(p, "utf8");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).end(html);
    } catch (e) {
      // try next path
    }
  }

  // If none worked, return diagnostic info
  const diag = paths.map(p => {
    try {
      const exists = fs.existsSync(p);
      return { path: p, exists };
    } catch (e) {
      return { path: p, error: e.message };
    }
  });

  // Also list files in common directories
  const dirs = {};
  [__dirname, path.join(__dirname, ".."), process.cwd()].forEach(d => {
    try {
      dirs[d] = fs.readdirSync(d);
    } catch (e) {
      dirs[d] = e.message;
    }
  });

  res.setHeader("Content-Type", "application/json");
  res.status(500).end(JSON.stringify({ error: "index.html not found", paths: diag, directories: dirs }, null, 2));
};
