import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import JSZip from 'jszip';

function findLocalZip() {
  const candidateDirs = [
    path.join(process.cwd(), '..'),
    process.cwd(),
    path.join(process.cwd(), 'data'),
  ];

  for (const dir of candidateDirs) {
    if (fs.existsSync(dir)) {
      try {
        const files = fs.readdirSync(dir);
        const zipFile = files.find(
          (f) => f.toLowerCase().startsWith('instagram') && f.toLowerCase().endsWith('.zip')
        );
        if (zipFile) {
          const fullPath = path.join(dir, zipFile);
          const stats = fs.statSync(fullPath);
          const usernameMatch = zipFile.match(/instagram[_-]([a-zA-Z0-9_.-]+)[_-]20\d\d/i);
          return {
            exists: true,
            fileName: zipFile,
            fullPath,
            sizeBytes: stats.size,
            sizeMb: Number((stats.size / (1024 * 1024)).toFixed(1)),
            detectedUsername: usernameMatch ? usernameMatch[1] : 'abhijit_u_11',
          };
        }
      } catch (e) {
        console.warn('[Instagram Local Detect] Error reading dir:', dir, e.message);
      }
    }
  }
  return { exists: false };
}

function cleanHtmlText(str) {
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

function parseDateString(str) {
  if (!str) return null;
  const dateMatch = str.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4},? \d{1,2}:\d{2}\s*(?:am|pm)?/i);
  if (dateMatch) {
    const d = new Date(dateMatch[0]);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return null;
}

function isRelevantHtmlPath(pRaw) {
  const p = pRaw.toLowerCase();
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
  return (
    p.includes('messages/inbox') ||
    p.includes('comments') ||
    p.includes('likes') ||
    p.includes('media/posts') ||
    p.includes('content/posts') ||
    p.includes('saved') ||
    p.includes('story_interactions') ||
    p.includes('recent_searches') ||
    p.includes('note_and_repost_interactions') ||
    p.includes('your_instagram_activity')
  );
}

// GET: Check if local archive exists
export async function GET() {
  const info = findLocalZip();
  return NextResponse.json(info);
}

// POST: Parse local archive directly on the server
export async function POST() {
  const localZip = findLocalZip();
  if (!localZip.exists) {
    return NextResponse.json({ error: 'No local Instagram ZIP archive found in project directory.' }, { status: 404 });
  }

  try {
    const buf = fs.readFileSync(localZip.fullPath);
    const zip = await JSZip.loadAsync(buf);

    const files = Object.keys(zip.files).filter((f) => f.endsWith('.html') && isRelevantHtmlPath(f));
    const allTimestamps = [];
    const results = [];
    let totalRawEvents = 0;

    for (const filename of files) {
      const text = await zip.files[filename].async('text');

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
      } else if (filename.includes('comments')) {
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
            results.push({ text: cText, timestamp, type: 'Comment', source: 'Post Comment', isNoise: false });
          }
        }
      } else if (filename.includes('likes')) {
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
      } else if (filename.includes('media/posts') || filename.includes('content/posts')) {
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
            results.push({ text: pText, timestamp, type: 'Post Caption', source: 'Authored Post', isNoise: false });
          }
        }
      } else if (filename.includes('recent_searches')) {
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
            results.push({ text: `Searched: "${qText}"`, timestamp, type: 'Search Query', source: 'Recent Search', isNoise: false });
          }
        }
      }
    }

    const meaningful = results.filter((r) => !r.isNoise && r.text.length >= 3);
    const pool = meaningful.length > 0 ? meaningful : results;

    const seen = new Set();
    const sorted = pool
      .filter((e) => {
        const key = `${e.text}|${e.timestamp}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      fileName: localZip.fileName,
      detectedUsername: localZip.detectedUsername,
      totalEventsCount: totalRawEvents,
      meaningfulCount: sorted.length,
      allTimestamps,
      entries: sorted.slice(0, 100),
    });
  } catch (err) {
    console.error('[Instagram Local Parse Error]:', err);
    return NextResponse.json({ error: 'Failed to parse local Instagram archive: ' + err.message }, { status: 500 });
  }
}
