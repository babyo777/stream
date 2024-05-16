const express = require("express");
const StreamAudio = require("ytdl-core");
const fs = require("fs");
const cluster = require("cluster");
const os = require("os");

const totalCpu = os.cpus().length;
const port = process.env.PORT || 4000;

if (cluster.isMaster) {
  for (let i = 0; i < totalCpu; i++) {
    cluster.fork();
  }
} else {
  const app = express();
  const cors = require("cors");
  app.use(cors());

  // Serve static files
  app.use(express.static("./"));

  // Stream audio endpoint
  app.get("/", async (req, res) => {
    try {
      const Link = req.query.url;
      if (!Link) {
        return res.status(400).json({ error: "URL not provided" });
      }

      if (fs.existsSync(`music/${Link}.mp3`)) {
        const range = req.headers.range;
        if (!range) {
          return res.status(404).json({ error: "Range header missing" });
        }

        const data = fs.statSync(`music/${Link}.mp3`);
        const fileSize = data.size;
        const chunk = 10 ** 6;
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + chunk, fileSize);
        const audio = fs.createReadStream(`music/${Link}.mp3`, { start, end });
        const contentLength = end - start + 1;

        const header = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": contentLength,
          "Content-Type": "audio/mpeg",
        };

        res.writeHead(206, header);
        audio.pipe(res);
      } else {
        res.status(404).json({ error: "File not found" });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Download audio endpoint
  app.get("/download/", async (req, res) => {
    try {
      const Link = req.query.url;
      const File = req.query.file;

      if (!Link) {
        return res.status(400).json({ error: "URL not provided" });
      }

      if (fs.existsSync(`music/${Link}.mp3`)) {
        const audio = fs.createReadStream(`music/${Link}.mp3`);
        const data = fs.statSync(`music/${Link}.mp3`);

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Length", data.size);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${File}.mp3"`
        );

        audio.pipe(res);
      } else {
        res.status(404).json({ error: "File not found" });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
