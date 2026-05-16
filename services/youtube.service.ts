import { YoutubeTranscript } from "youtube-transcript";

export type YouTubeMetadata = {
  title: string;
  channelName: string;
  thumbnailUrl: string;
  videoId: string;
  videoUrl: string;
};

export async function getYouTubeVideoId(url: string): Promise<string> {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return match[2];
  } else {
    throw new Error("Invalid YouTube URL.");
  }
}

export async function fetchYouTubeMetadata(url: string): Promise<YouTubeMetadata> {
  const videoId = await getYouTubeVideoId(url);
  const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

  try {
    const res = await fetch(oEmbedUrl);
    if (!res.ok) {
      throw new Error("Could not fetch YouTube metadata.");
    }
    const data = await res.json();

    return {
      title: data.title,
      channelName: data.author_name,
      thumbnailUrl: data.thumbnail_url,
      videoId,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch (error) {
    throw new Error("Failed to fetch YouTube metadata. Make sure the video is public.");
  }
}

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function fetchYouTubeTranscriptText(url: string): Promise<string> {
  const videoId = await getYouTubeVideoId(url);

  try {
    const transcriptObj = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcriptObj || transcriptObj.length === 0) {
      throw new Error("No transcript found.");
    }

    // Convert to a raw string format that includes timestamps
    // format: 0:01\nText here\n\n0:05\nNext text
    const rawText = transcriptObj.map(t => {
      const startTime = formatDuration(t.offset);
      // Clean up encoded HTML entities like &amp; or &#39;
      const text = t.text.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
      return `${startTime}\n${text}`;
    }).join("\n\n");

    return rawText;
  } catch (error) {
    console.error("Transcript fetch error:", error);
    throw new Error("Failed to fetch transcript. The video might not have captions enabled.");
  }
}
