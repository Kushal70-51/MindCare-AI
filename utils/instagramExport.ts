// Parses a user's OWN official Instagram data export (from Instagram's
// "Download Your Information" feature — a real Meta-provided file, not
// scraped or obtained via automated login) into a flat list of
// {text, timestamp, type, source} entries.
//
// Supports BOTH Meta formats:
// 1. HTML export archive (Meta's default format, containing messages, comments,
//    likes, post captions, and searches in clean semantic tables and divs).
// 2. JSON export archive (alternative format with structured nested JSON trees).
//
// Automatically filters out irrelevant technical/advertising files (ads, tracking cookies,
// device hardware info, billing, monetization, logins) and isolates meaningful psychological
// signals (conversations, self-reflections, comments, liked topics, searches, nocturnal timestamps).

import JSZip from 'jszip';

export interface InstagramExportEntry {
  text: string;
  timestamp: string; // ISO
  type?: string;
  source?: string;
  isNoise?: boolean;
}

export interface InstagramExportResult {
  entries: InstagramExportEntry[];
  allTimestamps: string[];
  totalEventsCount: number;
  meaningfulCount: number;
  detectedUsername: string;
}

const MAX_ENTRIES = 200;

function cleanMetaString(str: string): string {
  if (!str || typeof str !== 'string') return '';
  try {
    return decodeURIComponent(escape(str));
  } catch {
    return str;
  }
}

function cleanHtmlText(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDateString(str: string): string | null {
  if (!str) return null;
  // Matches dates like "Sep 21, 2025 12:06 am" or "Jul 12, 2026 4:09 am" or "Aug 11, 2026, 9:16 PM"
  const dateMatch = str.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4},? \d{1,2}:\d{2}\s*(?:am|pm)?/i);
  if (dateMatch) {
    const d = new Date(dateMatch[0]);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return null;
}

// Filter to only parse files relevant for psychological & digital wellbeing analysis
function isRelevantHtmlPath(path: string): boolean {
  const p = path.toLowerCase();

  // EXCLUDE irrelevant clutter (ads, device hardware, tracking cookies, logins)
  if (
    p.includes('ads_information') ||
    p.includes('apps_and_websites_off_of_instagram') ||
    p.includes('security_and_login_information') ||
    p.includes('personal_information/device_information') ||
    p.includes('personal_information/autofill_information') ||
    p.includes('shopping') ||
    p.includes('monetization') ||
    p.includes('synced_contacts') ||
    p.includes('start_here.html') ||
    p.includes('hide_story_from') ||
    p.includes('blocked_profiles') ||
    p.includes('removed_suggestions') ||
    p.includes('login_and_profile_creation') ||
    p.includes('login_activity') ||
    p.includes('logout_activity') ||
    p.includes('profile_activity') ||
    p.includes('signup_details') ||
    p.includes('camera_information')
  ) {
    return false;
  }

  // INCLUDE core behavioral signals
  return (
    p.includes('messages/inbox') ||
    p.includes('comments') ||
    p.includes('likes') ||
    p.includes('media/posts') ||
    p.includes('content/posts') ||
    p.includes('posts') ||
    p.includes('saved') ||
    p.includes('story_interactions') ||
    p.includes('recent_searches') ||
    p.includes('note_and_repost_interactions') ||
    p.includes('your_instagram_activity') ||
    p.includes('your_facebook_activity')
  );
}

// ----------------------------------------------------------------------------
// 1. HTML PARSER (FOR META DEFAULT HTML EXPORTS)
// ----------------------------------------------------------------------------
interface HtmlParseOutput {
  results: InstagramExportEntry[];
  allTimestamps: string[];
  totalRawEvents: number;
  detectedUsername: string;
}

async function parseHtmlZipExport(zip: JSZip, fallbackUsername?: string): Promise<HtmlParseOutput> {
  const files = Object.keys(zip.files).filter((f) => f.endsWith('.html') && isRelevantHtmlPath(f));
  const results: InstagramExportEntry[] = [];
  const allTimestamps: string[] = [];
  let totalRawEvents = 0;

  // Detect username from zip paths or filename
  let detectedUsername = fallbackUsername || '';
  if (!detectedUsername) {
    for (const f of Object.keys(zip.files)) {
      const m = f.match(/(?:instagram|facebook)[_-]([a-zA-Z0-9_.-]+)[_-]20\d\d/i);
      if (m && m[1]) {
        detectedUsername = m[1];
        break;
      }
    }
  }

  for (const filename of files) {
    const text = await zip.files[filename].async('text');

    // A. Direct Messages (inbox)
    if (filename.includes('messages/inbox')) {
      const msgBlocks = text.split(/<div class="pam _3-95 _2ph- _a6-g uiBoxWhite noborder">/i).slice(1);
      for (const block of msgBlocks) {
        const senderMatch = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
        const timeMatch = block.match(/<div class="_3-94 _a6-o">([\s\S]*?)<\/div>/i);
        const cleanBlock = block.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '');
        const textParts = cleanBlock.match(/<div><div><\/div><div>([\s\S]*?)<\/div>/i);
        const msgText = textParts ? cleanHtmlText(textParts[1].replace(/<[^>]+>/g, '')) : '';
        const timestamp = timeMatch ? parseDateString(timeMatch[1]) : null;

        if (timestamp) {
          allTimestamps.push(timestamp);
          totalRawEvents++;
        }

        if (msgText && timestamp && msgText.length >= 2) {
          const sender = senderMatch ? cleanHtmlText(senderMatch[1]) : '';
          const isSent = sender.toUpperCase().includes('ABHIJIT') || sender.toUpperCase().includes('YOU');
          const isNoise =
            msgText.includes('sent an attachment') ||
            msgText.startsWith('Reacted ') ||
            msgText.includes('liked a message');

          results.push({
            text: msgText,
            timestamp,
            type: isSent ? 'Sent Message' : 'Received Message',
            source: 'Direct Message',
            isNoise,
          });
        }
      }
    }

    // B. Post Comments
    else if (filename.includes('comments')) {
      const commentBlocks = text.split(/<table style="table-layout: fixed;">/i).slice(1);
      for (const block of commentBlocks) {
        const commentMatch = block.match(/Comment<div><div>([\s\S]*?)<\/div><\/div>/i);
        const timeMatch = block.match(/Time<\/td><td[^>]*>([\s\S]*?)<\/td>/i);
        const cText = commentMatch ? cleanHtmlText(commentMatch[1].replace(/<[^>]+>/g, '')) : '';
        const timestamp = timeMatch ? parseDateString(timeMatch[1]) : null;

        if (timestamp) {
          allTimestamps.push(timestamp);
          totalRawEvents++;
        }

        if (cText && timestamp && cText.length >= 2) {
          results.push({
            text: cText,
            timestamp,
            type: 'Comment',
            source: 'Post Comment',
            isNoise: false,
          });
        }
      }
    }

    // C. Liked Posts & Content
    else if (filename.includes('likes')) {
      const likeBlocks = text.split(/<div class="pam _3-95 _2ph- _a6-g uiBoxWhite noborder">/i).slice(1);
      for (const block of likeBlocks) {
        const captionMatch = block.match(/Caption<\/td><td[^>]*>([\s\S]*?)<\/td>/i);
        const userMatch = block.match(/Username<\/td><td[^>]*>([\s\S]*?)<\/td>/i);
        const timeMatch = block.match(/<div class="_3-94 _a6-o">([\s\S]*?)<\/div>/i);

        const caption = captionMatch ? cleanHtmlText(captionMatch[1].replace(/<[^>]+>/g, '')) : '';
        const user = userMatch ? cleanHtmlText(userMatch[1].replace(/<[^>]+>/g, '')) : '';
        const timestamp = timeMatch ? parseDateString(timeMatch[1]) : null;

        if (timestamp) {
          allTimestamps.push(timestamp);
          totalRawEvents++;
        }

        if (timestamp && (caption || user)) {
          results.push({
            text: caption ? `Liked post by @${user}: "${caption}"` : `Liked post by @${user}`,
            timestamp,
            type: 'Liked Post',
            source: 'Liked Content',
            isNoise: false,
          });
        }
      }
    }

    // D. Authored Posts & Captions
    else if (filename.includes('media/posts') || filename.includes('content/posts')) {
      const postBlocks = text.split(/<div class="pam _3-95 _2ph- _a6-g uiBoxWhite noborder">/i).slice(1);
      for (const block of postBlocks) {
        const titleMatch = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
        const timeMatch = block.match(/<div class="_3-94 _a6-o">([\s\S]*?)<\/div>/i);
        const pText = titleMatch ? cleanHtmlText(titleMatch[1].replace(/<[^>]+>/g, '')) : '';
        const timestamp = timeMatch ? parseDateString(timeMatch[1]) : null;

        if (timestamp) {
          allTimestamps.push(timestamp);
          totalRawEvents++;
        }

        if (pText && timestamp && pText.length >= 2) {
          results.push({
            text: pText,
            timestamp,
            type: 'Post Caption',
            source: 'Authored Post',
            isNoise: false,
          });
        }
      }
    }

    // E. Searches
    else if (filename.includes('recent_searches')) {
      const searchBlocks = text.split(/<div class="pam _3-95 _2ph- _a6-g uiBoxWhite noborder">/i).slice(1);
      for (const block of searchBlocks) {
        const queryMatch = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
        const timeMatch = block.match(/<div>((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^<]+)<\/div>/i);
        const qText = queryMatch ? cleanHtmlText(queryMatch[1].replace(/<[^>]+>/g, '')) : '';
        const timestamp = timeMatch ? parseDateString(timeMatch[1]) : null;

        if (timestamp) {
          allTimestamps.push(timestamp);
          totalRawEvents++;
        }

        if (qText && timestamp && qText.length >= 2) {
          results.push({
            text: `Searched: "${qText}"`,
            timestamp,
            type: 'Search Query',
            source: 'Recent Search',
            isNoise: false,
          });
        }
      }
    }
  }

  // Filter out noise reactions for sentiment while prioritizing actual messages, comments, captions
  const meaningful = results.filter((r) => !r.isNoise && r.text.length >= 3);
  const pool = meaningful.length > 0 ? meaningful : results;

  // Deduplicate and sort chronologically descending
  const seen = new Set<string>();
  const sorted = pool
    .filter((e) => {
      const key = `${e.text}|${e.timestamp}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    results: sorted,
    allTimestamps,
    totalRawEvents,
    detectedUsername: detectedUsername || 'instagram_user',
  };
}

// ----------------------------------------------------------------------------
// 2. JSON PARSER (FOR META JSON EXPORTS)
// ----------------------------------------------------------------------------
function walkJson(node: unknown, results: InstagramExportEntry[]) {
  if (Array.isArray(node)) {
    node.forEach((item) => walkJson(item, results));
    return;
  }
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>;

    // 1. Meta string_list_data format (liked posts, saved posts, reels, guides, etc.)
    if (Array.isArray(obj.string_list_data)) {
      (obj.string_list_data as Array<Record<string, unknown>>).forEach((entry) => {
        if (entry && (typeof entry.timestamp === 'number' || typeof entry.timestamp_ms === 'number')) {
          const rawSec =
            typeof entry.timestamp === 'number'
              ? entry.timestamp
              : Math.floor((entry.timestamp_ms as number) / 1000);
          const val = (entry.value as string) || '';
          const title = (obj.title as string) || '';
          let text = val.trim() || title.trim();
          if (!val && title) {
            text = `Activity: ${title.trim()}`;
          }
          if (text) {
            results.push({
              text: cleanMetaString(text),
              timestamp: new Date(rawSec * 1000).toISOString(),
              type: 'Interaction',
              source: 'Instagram Export',
            });
          }
        }
      });
    }

    // 2. Meta string_map_data format (comments, searches, notes, profile changes)
    if (obj.string_map_data && typeof obj.string_map_data === 'object') {
      const map = obj.string_map_data as Record<string, Record<string, unknown>>;
      let text = '';
      let timestampSec = 0;

      for (const [, subVal] of Object.entries(map)) {
        if (subVal && typeof subVal === 'object') {
          if (typeof subVal.value === 'string' && subVal.value.trim() && !text) {
            text = subVal.value.trim();
          }
          if (typeof subVal.timestamp === 'number' && subVal.timestamp > 0) {
            timestampSec = subVal.timestamp;
          } else if (typeof subVal.timestamp_ms === 'number' && (subVal.timestamp_ms as number) > 0) {
            timestampSec = Math.floor((subVal.timestamp_ms as number) / 1000);
          }
        }
      }

      if (!text && typeof obj.title === 'string' && obj.title.trim()) {
        text = obj.title.trim();
      }

      if (!timestampSec) {
        if (typeof obj.timestamp === 'number') timestampSec = obj.timestamp;
        else if (typeof obj.creation_timestamp === 'number') timestampSec = obj.creation_timestamp;
      }

      if (text && timestampSec > 0) {
        results.push({
          text: cleanMetaString(text),
          timestamp: new Date(timestampSec * 1000).toISOString(),
          type: 'Comment / Interaction',
          source: 'Instagram Export',
        });
      }
    }

    // 3. Posts & Media format (posts_1.json, stories, reels, media)
    const postTimestampSec =
      typeof obj.creation_timestamp === 'number'
        ? obj.creation_timestamp
        : typeof obj.taken_at === 'number'
        ? obj.taken_at
        : typeof obj.timestamp === 'number'
        ? obj.timestamp
        : typeof obj.timestamp_ms === 'number'
        ? Math.floor(obj.timestamp_ms / 1000)
        : 0;

    const mediaList = Array.isArray(obj.media) ? (obj.media as Array<Record<string, unknown>>) : [];
    const mediaTitle = (mediaList[0]?.title as string) || (mediaList[0]?.caption as string) || '';
    const postText = (
      (obj.title as string) ||
      (obj.caption as string) ||
      (obj.text as string) ||
      mediaTitle ||
      ''
    ).trim();

    if (postText && postTimestampSec > 0) {
      results.push({
        text: cleanMetaString(postText),
        timestamp: new Date(postTimestampSec * 1000).toISOString(),
        type: 'Post Caption',
        source: 'Instagram Export',
      });
    }

    // 4. Messages / DMs format (message_1.json)
    if (typeof obj.content === 'string' && obj.content.trim()) {
      const msgTsSec =
        typeof obj.timestamp_ms === 'number'
          ? Math.floor(obj.timestamp_ms / 1000)
          : typeof obj.timestamp === 'number'
          ? obj.timestamp
          : 0;
      if (msgTsSec > 0) {
        results.push({
          text: cleanMetaString(obj.content.trim()),
          timestamp: new Date(msgTsSec * 1000).toISOString(),
          type: 'Direct Message',
          source: 'Instagram Export',
        });
      }
    }

    // Recurse into children
    Object.entries(obj).forEach(([key, value]) => {
      if (key === 'string_list_data' || key === 'string_map_data' || key === 'media') return;
      walkJson(value, results);
    });
  }
}

// ----------------------------------------------------------------------------
// 3. UNIVERSAL INSTAGRAM EXPORT PARSER ENTRY POINT
// ----------------------------------------------------------------------------
export async function parseInstagramExportFile(file: File): Promise<InstagramExportResult> {
  let results: InstagramExportEntry[] = [];
  let allTimestamps: string[] = [];
  let totalRawEvents = 0;
  let detectedUsername = '';

  const filenameMatch = file.name.match(/instagram[_-]([a-zA-Z0-9_.-]+)[_-]20\d\d/i);
  if (filenameMatch && filenameMatch[1]) {
    detectedUsername = filenameMatch[1];
  }

  if (file.name.toLowerCase().endsWith('.zip')) {
    const zip = await JSZip.loadAsync(file);

    // Check if archive contains HTML files (Meta's default export format)
    const htmlEntries = Object.values(zip.files).filter(
      (f) => !f.dir && f.name.toLowerCase().endsWith('.html') && isRelevantHtmlPath(f.name)
    );

    // Check if archive contains JSON files (alternative Meta export format)
    const jsonEntries = Object.values(zip.files).filter(
      (f) => !f.dir && f.name.toLowerCase().endsWith('.json')
    );

    if (htmlEntries.length > 0) {
      // 1. Process HTML export
      const htmlData = await parseHtmlZipExport(zip, detectedUsername);
      results = htmlData.results;
      allTimestamps = htmlData.allTimestamps;
      totalRawEvents = htmlData.totalRawEvents;
      detectedUsername = htmlData.detectedUsername || detectedUsername;
    } else if (jsonEntries.length > 0) {
      // 2. Process JSON export
      for (const entry of jsonEntries) {
        try {
          const text = await entry.async('text');
          walkJson(JSON.parse(text), results);
        } catch {
          // Skip invalid JSON
        }
      }
      allTimestamps = results.map((r) => r.timestamp).filter(Boolean);
      totalRawEvents = results.length;
    } else {
      throw new Error(
        'The uploaded ZIP file does not contain any readable Instagram activity files (.html or .json). Please ensure you uploaded your official Meta download archive.'
      );
    }
  } else if (file.name.toLowerCase().endsWith('.html')) {
    // Single HTML file uploaded
    const text = await file.text();
    // Parse single file with quick DOM / regex parser
    const blocks = text.split(/<(?:div class="pam|table style=)/i).slice(1);
    for (const b of blocks) {
      const timeMatch = b.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4},? \d{1,2}:\d{2}\s*(?:am|pm)?/i);
      const textMatch = b.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || b.match(/<div><div><\/div><div>([\s\S]*?)<\/div>/i);
      if (timeMatch && textMatch) {
        const d = new Date(timeMatch[0]);
        if (!isNaN(d.getTime())) {
          const iso = d.toISOString();
          allTimestamps.push(iso);
          totalRawEvents++;
          results.push({
            text: cleanHtmlText(textMatch[1].replace(/<[^>]+>/g, '')),
            timestamp: iso,
            type: 'Instagram Activity',
            source: 'Single HTML Export',
          });
        }
      }
    }
  } else {
    // Single JSON file uploaded
    const text = await file.text();
    walkJson(JSON.parse(text), results);
    allTimestamps = results.map((r) => r.timestamp).filter(Boolean);
    totalRawEvents = results.length;
  }

  const seen = new Set<string>();
  const cleaned = results
    .filter((e) => e.text && e.text.trim().length >= 2)
    .filter((e) => {
      const key = `${e.text}|${e.timestamp}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (cleaned.length === 0 && allTimestamps.length === 0) {
    throw new Error(
      'No usable posts, comments, or conversations were detected in this export. Ensure your archive contains messages, comments, likes, or posts.'
    );
  }

  const entriesSlice = cleaned.slice(0, MAX_ENTRIES);
  const output: any = entriesSlice;
  output.entries = entriesSlice;
  output.allTimestamps = allTimestamps.length > 0 ? allTimestamps : cleaned.map((e) => e.timestamp);
  output.totalEventsCount = totalRawEvents > 0 ? totalRawEvents : cleaned.length;
  output.meaningfulCount = cleaned.length;
  output.detectedUsername = detectedUsername || 'instagram_user';

  return output as InstagramExportResult;
}
