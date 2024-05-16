const express = require("express");
const StreamAudio = require("ytdl-core");
const app = express();
const port = process.env.PORT || 4000;
const cors = require("cors");
const fs = require("fs");
const cluster = require("node:cluster");
const os = require("os");
const totalCpu = os.cpus().length;

if (cluster.isPrimary) {
  for (let i = 0; i < totalCpu; i++) {
    cluster.fork();
  }
} else {
  app.use(cors());
  app.use(express.static("./"));
  app.get("/", async (req, res) => {
    try {
      const Link = req.query.url;
      if (Link) {
        if (fs.existsSync(`music/${Link}.mp3`)) {
          const range = req.headers.range;
          if (!range) {
            res.status(404).json("error");
            return;
          }
          const data = fs.statSync(`music/${Link}.mp3`);
          const fileSize = data.size;
          const chunk = 10 ** 6;
          const start = Number(range.replace(/\D/g, ""));
          const end = Math.min(start + chunk, fileSize);
          const audio = fs.createReadStream(`music/${Link}.mp3`, {
            start,
            end,
          });
          const contentLength = end - start + 1;
          const header = {
            "content-range": `bytes ${start}-${end}/${fileSize}`,
            "accept-ranges": "bytes",
            "content-length": contentLength,
            "content-type": "audio/mpeg",
          };
          res.writeHead(206, header);
          audio.pipe(res);
          return;
        }

        const Download = StreamAudio(Link, {
          filter: "videoandaudio",
          quality: "highestvideo",
        }).pipe(fs.createWriteStream(`music/${Link}.mp3`));

        Download.on("error", () => console.error("error"));
        Download.on("finish", () => {
          const range = req.headers.range;
          if (!range) {
            res.status(404).json("error");
          }
          const data = fs.statSync(`music/${Link}.mp3`);
          const fileSize = data.size;
          const chunk = 10 ** 6;
          const start = Number(range.replace(/\D/g, ""));
          const end = Math.min(start + chunk, fileSize);
          const audio = fs.createReadStream(`music/${Link}.mp3`, {
            start,
            end,
          });
          const contentLength = end - start + 1;
          const header = {
            "content-range": `bytes ${start}-${end}/${fileSize}`,
            "accept-ranges": "bytes",
            "content-length": contentLength,
            "content-type": "audio/mpeg",
          };
          res.writeHead(206, header);
          audio.pipe(res);
        });
      } else {
        res.status(200).json("url not provided");
      }
    } catch (error) {
      console.log(error.message);
      res.json("error");
    }
  });
  app.get("/download/", async (req, res) => {
    const Link = req.query.url;
    const File = req.query.file;

    if (Link) {
      try {
        if (fs.existsSync(`music/${Link}.mp3`)) {
          const audio = fs.createReadStream(`music/${Link}.mp3`);
          const data = fs.statSync(`music/${Link}.mp3`);
          res.setHeader("content-type", "audio/mpeg");
          res.setHeader("Accept-Ranges", "bytes");
          res.setHeader("content-length", data.size);

          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${File}.mp3"`
          );
          audio.pipe(res);
          return;
        }

        const Download = StreamAudio(Link, {
          filter: "videoandaudio",
          quality: "highestvideo",
        }).pipe(fs.createWriteStream(`music/${Link}.mp3`));

        Download.on("error", () => console.error("error"));
        Download.on("finish", () => {
          console.log(Link);

          const audio = fs.createReadStream(`music/${Link}.mp3`);
          const data = fs.statSync(`music/${Link}.mp3`);
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${File}.mp3"`
          );
          res.setHeader("content-type", "audio/mpeg");
          res.setHeader("Accept-Ranges", "bytes");
          res.setHeader("content-length", data.size);
          audio.pipe(res);
        });
      } catch (error) {
        console.log(error.message);
        res.json("error");
      }
    } else {
      res.status(200).json("url not provided");
    }
  });
  app.listen(port, () => {
    console.log(`http://localhost:${port}`);
  });
}
