const express = require("express");
const StreamAudio = require("ytdl-core");
const app = express();
const port = process.env.PORT || 4000;
const fs = require("fs");
const cors = require("cors");
app.use(cors());
app.get("/", async (req, res) => {
  try {
    const Link = req.query.url;
    if (Link) {
      const info = await StreamAudio.getInfo(Link);
      StreamAudio.chooseFormat(info.formats, {
        filter: "videoandaudio",
        quality: "lowestvideo",
      });
      if (fs.existsSync(`music/${Link}.mp3`)) {
        const audio = fs.createReadStream(`music/${Link}.mp3`);
        const data = fs.statSync(`music/${Link}.mp3`);
        res.setHeader("content-type", "audio/mpeg");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("content-length", data.size);
        res.setHeader("Content-Disposition", `inline; filename="audio.mp3"`);

        audio.pipe(res);
        return;
      }

      const Download = StreamAudio(Link, {
        filter: "videoandaudio",
        quality: "lowestvideo",
      }).pipe(fs.createWriteStream(`music/${Link}.mp3`));

      Download.on("error", () => console.error("error"));
      Download.on("finish", () => {
        const audio = fs.createReadStream(`music/${Link}.mp3`);
        const data = fs.statSync(`music/${Link}.mp3`);
        res.setHeader("content-type", "audio/mpeg");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("content-length", data.size);
        res.setHeader("Content-Disposition", `inline; filename="audio.mp3"`);

        audio.pipe(res);
        return;
      });
    } else {
      res.status(200).json("url not provided");
    }
  } catch (error) {
    console.log(error.message);
    res.json({ error: error.message });
  }
});
app.get("/download/", async (req, res) => {
  const Link = req.query.url;
  const File = req.query.file;

  if (Link) {
    try {
      const info = await StreamAudio.getInfo(Link);
      StreamAudio.chooseFormat(info.formats, {
        filter: "videoandaudio",
        quality: "lowestvideo",
      });
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
        quality: "lowestvideo",
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
      console.log(error);
      res.status(500).json(error.message);
    }
  } else {
    res.status(200).json("url not provided");
  }
});
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
