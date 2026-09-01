// api/page.js - Serve index.html via serverless function
const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  const htmlPath = path.join(__dirname, "..", "index.html");
  try {
    const html = fs.readFileSync(htmlPath, "utf8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
    res.status(200).end(html);
  } catch (err) {
    res.status(500).json({ error: "Could not load page", details: err.message });
  }
};
