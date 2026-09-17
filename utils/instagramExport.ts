// Parses a user's OWN official Instagram data export (from Instagram's
// "Download Your Information" feature — a real Meta-provided file, not
// scraped or obtained via automated login) into a flat list of
// {text, timestamp} entries. Instagram's export ships many differently-
// shaped JSON files (posts, comments, likes, story interactions, ...); this
// walks the tree generically rather than hardcoding each file's schema, so
// it degrades gracefully across export format changes.
import JSZip from 'jszip';

export interface InstagramExportEntry {
  text: string;
  timestamp: string; // ISO
}

const MAX_ENTRIES = 60;

function walk(node: unknown, results: InstagramExportEntry[]) {
  if (Array.isArray(node)) {
    node.forEach((item) => walk(item, results));
    return;
  }
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>;

    // Most common Instagram export shape: { title, string_list_data: [{ value, href, timestamp }] }
    if (Array.isArray(obj.string_list_data)) {
      (obj.string_list_data as Array<Record<string, unknown>>).forEach((entry) => {
        if (entry && typeof entry.timestamp === 'number') {
          const text = (entry.value as string) || (obj.title as string) || '';
          if (text) results.push({ text, timestamp: new Date((entry.timestamp as number) * 1000).toISOString() });
        }
      });
    }

    // Comments-style shape: { string_map_data: { Comment: { value, timestamp } } }
    if (obj.string_map_data && typeof obj.string_map_data === 'object') {
      Object.values(obj.string_map_data as Record<string, Record<string, unknown>>).forEach((entry) => {
        if (entry && typeof entry.timestamp === 'number') {
          const text = (entry.value as string) || '';
          if (text) results.push({ text, timestamp: new Date((entry.timestamp as number) * 1000).toISOString() });
        }
      });
    }

    // Posts-style shape: { title, creation_timestamp, media: [...] }
    if (typeof obj.creation_timestamp === 'number') {
      const media = obj.media as Array<Record<string, unknown>> | undefined;
      const text = (obj.title as string) || (media?.[0]?.title as string) || '';
      if (text) {
        results.push({ text, timestamp: new Date((obj.creation_timestamp as number) * 1000).toISOString() });
      }
    }

    Object.entries(obj).forEach(([key, value]) => {
      if (key === 'string_list_data' || key === 'string_map_data') return;
      walk(value, results);
    });
  }
}

export async function parseInstagramExportFile(file: File): Promise<InstagramExportEntry[]> {
  const results: InstagramExportEntry[] = [];

  if (file.name.toLowerCase().endsWith('.zip')) {
    const zip = await JSZip.loadAsync(file);
    const jsonEntries = Object.values(zip.files).filter(
      (f) => !f.dir && f.name.toLowerCase().endsWith('.json')
    );
    for (const entry of jsonEntries) {
      try {
        const text = await entry.async('text');
        walk(JSON.parse(text), results);
      } catch {
        // Skip any file that isn't parseable JSON — export ZIPs also
        // contain images/HTML we don't care about.
      }
    }
  } else {
    const text = await file.text();
    walk(JSON.parse(text), results);
  }

  const seen = new Set<string>();
  const cleaned = results
    .filter((e) => e.text && e.text.trim().length >= 3)
    .filter((e) => {
      const key = `${e.text}|${e.timestamp}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (cleaned.length === 0) {
    throw new Error(
      'No usable text/timestamp entries were found in that file. Try uploading the full export .zip, or a file like posts_1.json / comments.json / liked_posts.json.'
    );
  }

  return cleaned.slice(0, MAX_ENTRIES);
}
