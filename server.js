import express from "express";
import { Innertube, UniversalCache, Utils } from "youtubei.js";

const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
  });

  // Route to stream the song based on its ID
  app.get("/stream/:songId", async (req, res) => {
    const songId = req.params.songId;

    try {
      // Get the audio stream from YouTube Music
      const stream = await yt.download(songId, {
        type: "audio",
        quality: "best",
        format: "mp4",
        client: "YTMUSIC",
      });

      // Set headers for real-time streaming
      res.setHeader("Content-Type", "audio/m4a");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Content-Disposition", 'inline; filename="stream.m4a"');
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Transfer-Encoding", "chunked");
      res.status(200);

      console.info(`Streaming song with ID: ${songId}`);

      // Write chunks of the audio stream to the response
      for await (const chunk of Utils.streamToIterable(stream)) {
        res.write(chunk);
      }

      res.end(); // End the response after streaming
      console.info(`Finished streaming song: ${songId}`);
    } catch (error) {
      console.error(`Error streaming song: ${songId}`, error);
      res.status(500).send("Error streaming the song.");
    }
  });

  // Start the Express server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})();
