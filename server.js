import express from "express";
import { Innertube, UniversalCache, Utils } from "youtubei.js";

const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
    cookie:
      "PREF=repeat=NONE;_gcl_au=1.1.1502659297.1728791448;VISITOR_INFO1_LIVE=NvNH48Rg2dE;VISITOR_PRIVACY_METADATA=CgJJThIEGgAgJA%3D%3D;SID=g.a000pAjgpC5OLyBj_WRThEHIlSCLyo1_cfXaS4CxR5V-2e_7GMNxSqBMkm08kf1VBfhz0oWFdwACgYKAeUSARESFQHGX2MiX2A5wa306xwZRRqKWeR95xoVAUF8yKrXhQnwjwW1yeK6JH7hn_zP0076;__Secure-1PSIDTS=sidts-CjEBQlrA-AfNtmBU1WHWaqZfJNckd8rxZyaFsLNa_LZ4HdeLBXytL5wxirXHTcddbCGDEAA;__Secure-3PSIDTS=sidts-CjEBQlrA-AfNtmBU1WHWaqZfJNckd8rxZyaFsLNa_LZ4HdeLBXytL5wxirXHTcddbCGDEAA;__Secure-1PSID=g.a000pAjgpC5OLyBj_WRThEHIlSCLyo1_cfXaS4CxR5V-2e_7GMNxQR6mZJFjU9VYL_uPwwKDgQACgYKAcUSARESFQHGX2MiXkI4ZDbt1mw0cML9JKjjaBoVAUF8yKpN6UAh6HP-a7E8jpkLrtrA0076;__Secure-3PSID=g.a000pAjgpC5OLyBj_WRThEHIlSCLyo1_cfXaS4CxR5V-2e_7GMNxq_T7RUVsba8jidmwOyMgrAACgYKAc0SARESFQHGX2Miy3KRcXgE3o30tQcIxf23kRoVAUF8yKqWRd2WZF8S9WTB090cW8W30076;HSID=Ap58esUUGDqurtplt;SSID=AbOJcug75NdgCPRM6;APISID=hTeFiMgsIEti7tpW/A_E4CTOLSBUA7Tge9;SAPISID=t2lk19bSPiFld9ij/AMvC-vxOFVBM0WNC9;__Secure-1PAPISID=t2lk19bSPiFld9ij/AMvC-vxOFVBM0WNC9;__Secure-3PAPISID=t2lk19bSPiFld9ij/AMvC-vxOFVBM0WNC9;LOGIN_INFO=AFmmF2swRQIhANxQlVHPEEW163SUK9egc-t4eDKGvG3wPVaJzLBihyA9AiBtTvMwSytwJwKgNeWdvKETppY6iZF2dvDBNCIa8A_myA:QUQ3MjNmeHVJUHpxLVR5SkZ5eTZGeTI0MlVUV0NxOVJ0X3lqR0VDNU9vLUEyMlFBODdBSGlabElEQ3VCT0tpNUhvaGMyYkVwQUUzTE9jM0xLMDdzdjZQR0JJT2JSVUxKeGxGOHRCVU4tVm5fRi1iRDNSZnlHVHBUdEtPSlRweHNtVEdFLXdnMzZOaUlJUHA5TmpSTFkwYm5YVnFINDczMkZn;SIDCC=AKEyXzUln97KPo7UiauklK6dMQp0uudvpasoDTa3mlz0CNRrq5n9XoERryZu51dgzxg6yQjrqQ;__Secure-1PSIDCC=AKEyXzVoClqETH0HON__u2cUBjRE1mDRtL_CF-dOSz2zwSDMkRD0GIjP6Q2eeojKQSCBX5kJ_A;__Secure-3PSIDCC=AKEyXzVjpkqeMnttwL-eStnvtfKJW713yfGzc-t3sC_056Lv1nT0C3EbFdXcqpnQ50UsdxgP",
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
