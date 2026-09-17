# MindCare AI — API Keys & External Integrations Context

This document provides a comprehensive reference of the 3 dedicated API keys, task-priority assignment, and external secrets used throughout the **MindCare AI** platform (Next.js 14 + React 18 + TypeScript).

> **Important Architecture Note:** OpenRouter has been completely removed. AI inference is handled strictly by the 3 dedicated API keys assigned by task priority: **Groq LPU** for high-frequency sub-second clinical interviews, **Gemini Key 1** for interactive report consultation, and **Gemini Key 2** shared across all social media insights.

---

## 📑 Table of Contents
1. [Task-Priority Architecture & Assignment](#1-task-priority-architecture--assignment)
2. [Master Inventory Table](#2-master-inventory-table)
3. [AI & LLM Inference Providers](#3-ai--llm-inference-providers)
   - [Groq LPU API (`GROQ_API_KEY`) — High Frequency](#groq-lpu-api-groq_api_key--high-frequency)
   - [Google Gemini API Key 1 (`GEMINI_API_KEY_REPORTCHAT`) — Medium Frequency](#google-gemini-api-key-1-gemini_api_key_reportchat--medium-frequency)
   - [Google Gemini API Key 2 (`GEMINI_API_KEY_SOCIAL`) — Low Frequency](#google-gemini-api-key-2-gemini_api_key_social--low-frequency)
4. [Fallback Chain Architecture](#4-fallback-chain-architecture)
5. [YouTube Integration (Social Context)](#5-youtube-integration-social-context)
   - [YouTube Data API v3 (`YOUTUBE_API_KEY`)](#youtube-data-api-v3-youtube_api_key)
   - [YouTube OAuth 2.0 (`YOUTUBE_OAUTH_*`)](#youtube-oauth-20-youtube_oauth_)
6. [Reddit Integration (Forum Wellbeing Analysis)](#6-reddit-integration-forum-wellbeing-analysis)
   - [Reddit OAuth API (`REDDIT_*`)](#reddit-oauth-api-reddit_)
7. [Administrative Access Control (`ADMIN_PASSCODE`)](#7-administrative-access-control-admin_passcode)
8. [Environment File Configuration (`.env.local`)](#8-environment-file-configuration-envlocal)

---

## 1. Task-Priority Architecture & Assignment

The platform assigns LLM inference keys strictly according to route latency and frequency requirements:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 1. HIGH FREQUENCY & SPEED-CRITICAL                                              │
│    Route: app/api/interview/route.js                                            │
│    Key: GROQ_API_KEY                                                            │
│    Engine: Groq LPU (qwen/qwen3.8-27b)                                          │
│    Latency: 200ms – 700ms (Immediate voice turn-taking)                          │
│    Fallback: Gemini Fallback (GEMINI_API_KEY_REPORTCHAT / GEMINI_API_KEY_SOCIAL)│
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
┌───────────────────────────────────────▼─────────────────────────────────────────┐
│ 2. MEDIUM FREQUENCY & DEPTH-CRITICAL                                            │
│    Route: app/api/report-chat/route.js                                          │
│    Key: GEMINI_API_KEY_REPORTCHAT                                               │
│    Engine: Google Gemini (gemini-flash-latest / gemini-2.5-flash)                │
│    Role: SHAP report clinical Q&A, condition breakdowns & evidence explanation   │
│    Fallback: GEMINI_API_KEY_SOCIAL ➔ GROQ_API_KEY                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
┌───────────────────────────────────────▼─────────────────────────────────────────┐
│ 3. LOW FREQUENCY / ANALYTIC DATA TYPE                                           │
│    Routes:                                                                      │
│      • app/api/social/youtube-insight/route.js                                  │
│      • app/api/social/reddit-insight/route.js                                   │
│      • app/api/social/instagram-insight/route.js                                │
│    Key: GEMINI_API_KEY_SOCIAL                                                   │
│    Engine: Google Gemini (gemini-flash-latest / gemini-2.5-flash)                │
│    Role: Circadian rhythm shift, time-of-day distribution & wellbeing narrative │
│    Fallback: GEMINI_API_KEY_REPORTCHAT                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Master Inventory Table

| Environment Variable | Service Provider | Primary Model / Endpoint | File Paths Using This Key | Purpose in Application |
| :--- | :--- | :--- | :--- | :--- |
| **`GROQ_API_KEY`** | Groq Cloud | `qwen/qwen3.8-27b`<br>LPU Inference Engine | • `app/api/interview/route.js` | Ultra-low-latency clinical consultation dialogue in English, Hindi (Devanagari), Marathi (Devanagari) (200ms–700ms). |
| **`GEMINI_API_KEY_REPORTCHAT`** | Google AI Studio | `gemini-flash-latest`<br>`gemini-2.5-flash` | • `app/api/report-chat/route.js` | Interactive post-assessment clinical Q&A assistant explaining patient SHAP report scores. |
| **`GEMINI_API_KEY_SOCIAL`** | Google AI Studio | `gemini-flash-latest`<br>`gemini-2.5-flash` | • `app/api/social/youtube-insight/route.js`<br>• `app/api/social/reddit-insight/route.js`<br>• `app/api/social/instagram-insight/route.js` | Shared across all 3 social insight routes to synthesize circadian sleep/lifestyle patterns. |
| **`YOUTUBE_API_KEY`** | Google Cloud Console | YouTube Data API v3<br>`commentThreads`, `videos` | • `app/api/social/youtube-comments/route.js` | Fetches public video titles and comments for in-browser DistilRoBERTa emotion scoring. |
| **`YOUTUBE_OAUTH_CLIENT_ID`** | Google Cloud Console | Google OAuth 2.0 Web Client | • `app/api/auth/youtube/login/route.js`<br>• `app/api/auth/youtube/callback/route.js`<br>• `lib/youtubeAuth.js` | Initiates Google sign-in consent flow for YouTube connection. |
| **`YOUTUBE_OAUTH_CLIENT_SECRET`**| Google Cloud Console | Google OAuth 2.0 Secret | • `app/api/auth/youtube/callback/route.js`<br>• `lib/youtubeAuth.js` | Exchanges authorization code for refresh & access tokens. |
| **`YOUTUBE_OAUTH_REDIRECT_URI`** | Google Cloud Console | Callback URL (`/api/auth/youtube/callback`) | • `app/api/auth/youtube/login/route.js`<br>• `app/api/auth/youtube/callback/route.js` | Validates OAuth redirect target. |
| **`REDDIT_CLIENT_ID`** | Reddit Developer Portal | Reddit Web App ID | • `app/api/auth/reddit/login/route.js`<br>• `app/api/auth/reddit/callback/route.js`<br>• `lib/redditAuth.js` | Initiates user Reddit connection flow. |
| **`REDDIT_CLIENT_SECRET`** | Reddit Developer Portal | Reddit Secret Key | • `app/api/auth/reddit/callback/route.js`<br>• `lib/redditAuth.js` | Authenticates backend requests to Reddit OAuth server. |
| **`REDDIT_REDIRECT_URI`** | Reddit Developer Portal | Callback URL (`/api/auth/reddit/callback`) | • `app/api/auth/reddit/login/route.js`<br>• `app/api/auth/reddit/callback/route.js` | Matches configured Reddit redirect URI. |
| **`REDDIT_USER_AGENT`** | Custom Identifier | Header format: `web:mindcare-ai:v1.0` | • `lib/redditAuth.js`<br>• `app/api/auth/reddit/callback/route.js`<br>• `app/api/auth/reddit/me/route.js`<br>• `app/api/social/reddit-profile/route.js` | Prevents Reddit API rate-limiting blocks. |
| **`ADMIN_PASSCODE`** | Internal Secret | Static authorization token | • `app/api/admin/doctors/route.js`<br>• `app/api/admin/doctors/[id]/route.js` | Secures the Clinical Directory / Doctor Management endpoints. |

---

## 3. AI & LLM Inference Providers

### Groq LPU API (`GROQ_API_KEY`) — High Frequency
* **Target Route**: `app/api/interview/route.js`
* **Model**: `qwen/qwen3.8-27b`
* **Endpoint**: `https://api.groq.com/openai/v1/chat/completions`
* **Characteristics**: Fastest inference engine available (<700ms). Crucial for live spoken conversations so that the user does not experience awkward pauses after answering.
* **Output**: Strictly typed JSON: `{"reply": string, "mood_tag": string, "continue_interview": boolean}`.

### Google Gemini API Key 1 (`GEMINI_API_KEY_REPORTCHAT`) — Medium Frequency
* **Target Route**: `app/api/report-chat/route.js`
* **Models**: `gemini-flash-latest` (fallback: `gemini-2.5-flash`)
* **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`
* **Characteristics**: Strong clinical reasoning and grounding in structured JSON context. Parses the entire SHAP assessment object to answer patient and clinician questions.

### Google Gemini API Key 2 (`GEMINI_API_KEY_SOCIAL`) — Low Frequency
* **Target Routes**:
  1. `app/api/social/youtube-insight/route.js`
  2. `app/api/social/reddit-insight/route.js`
  3. `app/api/social/instagram-insight/route.js`
* **Models**: `gemini-flash-latest` (fallback: `gemini-2.5-flash`)
* **Characteristics**: Generates structured JSON adhering to `REPLY_SCHEMA` (`activityPattern`, `lifestyleSignal`, `contentThemeNote`, `summary`) to identify circadian rhythm disruptions and sleep hygiene indicators.

---

## 4. Fallback Chain Architecture

If any key experiences rate limits or network issues, the system automatically cascades through the fallback chain:

1. **Interview Route (`/api/interview`)**:
   - `GROQ_API_KEY` (Groq LPU `qwen/qwen3.8-27b`)
   - ➔ **Fallback**: `GEMINI_API_KEY_REPORTCHAT` / `GEMINI_API_KEY_SOCIAL` (Gemini API)
   - ➔ **Safety Net**: Localized offline clinical dialog engine (`buildFallbackReply` in English, Hindi, and Marathi).

2. **Report Chat Route (`/api/report-chat`)**:
   - `GEMINI_API_KEY_REPORTCHAT` (Gemini `gemini-flash-latest`)
   - ➔ **Fallback 1**: `GEMINI_API_KEY_SOCIAL` (Secondary Gemini key)
   - ➔ **Fallback 2**: `GROQ_API_KEY` (Groq LPU `qwen/qwen3.8-27b`)

3. **Social Insight Routes (`/api/social/*`)**:
   - `GEMINI_API_KEY_SOCIAL` (Gemini `gemini-flash-latest`)
   - ➔ **Fallback**: `GEMINI_API_KEY_REPORTCHAT`
   - ➔ **Safety Net**: Deterministic statistical summary calculated from timestamps.

---

## 5. YouTube Integration (Social Context)

### YouTube Data API v3 (`YOUTUBE_API_KEY`)
* **Role**: Public video metadata and comment extraction.
* **Endpoint Called**: `https://www.googleapis.com/youtube/v3/commentThreads` & `videos`.
* **Where Used**: `app/api/social/youtube-comments/route.js`.

### YouTube OAuth 2.0 (`YOUTUBE_OAUTH_*`)
* **Role**: Connect user's YouTube account to extract real activity timestamps (subscriptions and liked videos).
* **Scopes**: `https://www.googleapis.com/auth/youtube.readonly`.

---

## 6. Reddit Integration (Forum Wellbeing Analysis)

### Reddit OAuth API (`REDDIT_*`)
* **Role**: Connect user's Reddit account to analyze subreddit participation and posting timestamps.
* **Scopes**: `identity`, `history`, `read`, `mysubreddits`.

---

## 7. Administrative Access Control (`ADMIN_PASSCODE`)

* **Role**: Static authorization bearer token protecting doctor CRUD operations at `/api/admin/doctors`.

---

## 8. Environment File Configuration (`.env.local`)

```env
# 1. Groq LPU API Key — Exclusively used for Real-Time Clinical Interview (High Frequency / Sub-Second)
GROQ_API_KEY=your_groq_api_key_here

# 2. Google Gemini API Key 1 — Exclusively used for Interactive Report Q&A Chatbot (Medium Frequency)
GEMINI_API_KEY_REPORTCHAT=your_gemini_reportchat_key_here

# 3. Google Gemini API Key 2 — Shared across all 3 Social Insights Routes (Low Frequency)
GEMINI_API_KEY_SOCIAL=your_gemini_social_key_here

# Platform Admin Passcode
ADMIN_PASSCODE=your_admin_passcode_here

# YouTube Data API v3 & OAuth 2.0 Credentials
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_OAUTH_CLIENT_ID=your_youtube_oauth_client_id_here
YOUTUBE_OAUTH_CLIENT_SECRET=your_youtube_oauth_client_secret_here
YOUTUBE_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback

# Reddit OAuth Credentials
REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_CLIENT_SECRET=your_reddit_client_secret_here
REDDIT_REDIRECT_URI=http://localhost:3000/api/auth/reddit/callback
REDDIT_USER_AGENT=web:mindcare-ai:v1.0
```
