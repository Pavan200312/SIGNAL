# SnapCAC — AI Real Estate Video Engine

SnapCAC is an automated content engine for Snaphomz that generates real estate videos using live data, AI-written scripts, human-sounding voiceover, branded visuals, and auto-posting to social platforms.

The main goal is simple:

> Reduce Snaphomz customer acquisition cost from paid ads to organic content by generating and publishing real estate videos every day.

---

## 1. One-Line Pitch

Snaphomz currently spends around **$300 to acquire one user through paid ads**.  
SnapCAC reduces that customer acquisition cost to **$0** by automatically creating and posting AI-generated real estate videos to YouTube Shorts and Twitter/X.

---

## 2. Problem

Paid ads are expensive and do not scale efficiently.

For Snaphomz, acquiring one user through paid ads costs around **$300**. If the platform needs hundreds or thousands of users, this becomes unsustainable.

At the same time, real estate buyers and sellers are already spending time on YouTube Shorts, Twitter/X, Instagram Reels, TikTok, Google Search, and real estate market content.

They are looking for answers about mortgage rates, home prices, affordability, rent vs buy, buyer mistakes, local market trends, and investment opportunities.

The issue is not that users are unavailable. The issue is that they do not know Snaphomz exists.

SnapCAC solves this by turning live real estate data into daily short-form content that brings users to Snaphomz organically.

---

## 3. What We Built

SnapCAC is a fully automated AI content engine.

With one command, the system can:

1. Fetch live mortgage and market data.
2. Generate a short real estate video script using AI.
3. Convert the script into a human-sounding voiceover.
4. Select background visuals that match each scene.
5. Assemble a branded 9:16 vertical video.
6. Add captions, branding, and disclaimer.
7. Upload the video to YouTube Shorts.
8. Post matching slide images to Twitter/X.

Example command:

```bash
python main.py auto market_pulse 10001
```

This creates a market pulse video for ZIP code `10001`.

---

## 4. Hackathon Demo Flow

### Step 1 — Run the Pipeline

```bash
python main.py auto market_pulse 10001
```

Explain what is happening while the terminal runs:

- The system is fetching live mortgage data.
- The AI is writing a 5-scene video script.
- Microsoft Jenny Neural is generating the voiceover.
- The system is choosing different background visuals for each scene.
- MoviePy and FFmpeg are assembling the final 9:16 video.
- The final video is ready for YouTube Shorts.

### Step 2 — Open the Generated Video

Windows:

```bash
start "output\Snaphomz Market Pulse.mp4"
```

macOS:

```bash
open "output/Snaphomz Market Pulse.mp4"
```

Linux:

```bash
xdg-open "output/Snaphomz Market Pulse.mp4"
```

While showing the video, point out:

- Dark premium real estate style.
- Snaphomz orange branding on every frame.
- Real data, not generic content.
- Each image matches the scene topic.
- Human-sounding Jenny Neural voice.
- Legal disclaimer at the end.
- 9:16 format ready for YouTube Shorts, Instagram Reels, and TikTok.

### Step 3 — Show Live Upload Proof

Show the live YouTube Shorts upload:

```text
https://www.youtube.com/shorts/1E2U9r-27A8
```

Say:

> This is already live on YouTube. The system works end to end — from data to script to video to upload.

---

## 5. Business Impact

| Metric | Paid Ads | SnapCAC |
|---|---:|---:|
| Cost per video | Not applicable | $0 |
| Videos per day | Not applicable | 3 |
| Average views per video | Not applicable | 5,000–15,000 |
| CTR to Snaphomz | Paid traffic | 2% target |
| Signups per video | Paid acquisition | ~10 users target |
| CAC | $300/user | $0/user |
| Monthly content volume | Not scalable manually | 90 videos |
| Monthly user potential | Expensive | ~900 users |
| Estimated monthly savings | — | $270,000 |

### Calculation

If SnapCAC posts:

- 3 videos per day
- 90 videos per month
- 10 users per video

Then:

```text
90 videos × 10 users = 900 users/month
900 users × $300 paid CAC = $270,000 saved/month
```

This means SnapCAC can potentially generate the same user volume without spending paid ad budget.

---

## 6. How SnapCAC Scales

SnapCAC is not limited to one ZIP code or one video style.

It can generate content for:

- Any ZIP code in the United States
- Buyers
- Sellers
- Investors
- First-time homebuyers
- Luxury buyers
- Renters comparing rent vs buy
- Market watchers
- Agents
- Local real estate trends

Examples:

```bash
python main.py auto market_pulse 10001
python main.py auto buyer_tip 90210
python main.py auto seller_alert 33101
python main.py auto affordability_check 78701
python main.py auto rent_vs_buy 94105
```

The system can run automatically on a schedule, such as:

- Morning market pulse
- Afternoon buyer/seller insight
- Evening local ZIP trend

---

## 7. Supported Content Types

| Content Type | Purpose |
|---|---|
| `market_pulse` | Local market update using ZIP-level data |
| `buyer_tip` | Advice for homebuyers |
| `seller_alert` | Seller-focused market opportunity |
| `affordability_check` | Explains payment pressure and affordability |
| `rent_vs_buy` | Helps users compare renting vs buying |
| `mortgage_rate_update` | Explains current mortgage rate impact |
| `zip_trend` | Local ZIP code trend analysis |
| `first_time_buyer` | Educational content for new buyers |
| `investor_signal` | Investor-focused opportunity |
| `price_drop_alert` | Highlights market price movement |
| `neighborhood_snapshot` | Area-level overview |
| `homebuying_mistake` | Warns buyers about common mistakes |
| `snaphomz_tool` | Explains a Snaphomz tool or feature |
| `call_to_action` | Direct conversion-focused video |

---

## 8. Tech Stack

| Layer | Tool |
|---|---|
| AI script generation | Groq + Llama 3.3 70B |
| Voice generation | Microsoft edge-tts, Jenny Neural |
| Mortgage data | FRED API |
| Market data | ZIP-level real estate data source |
| Video assembly | MoviePy |
| Rendering | FFmpeg |
| YouTube upload | YouTube Data API v3 |
| Twitter/X posting | Tweepy |
| Scheduler | Cron / Task Scheduler / GitHub Actions / server cron |
| Output format | 9:16 vertical MP4 |

---

## 9. Environment Variables

Create a `.env` file in the project root.

```env
GROQ_API_KEY=your_groq_api_key
FRED_API_KEY=your_fred_api_key

YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REFRESH_TOKEN=your_youtube_refresh_token

TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret

BRAND_NAME=Snaphomz
BRAND_COLOR=#FF6A00
DEFAULT_VOICE=en-US-JennyNeural
```

---

## 10. Recommended Project Structure

```text
snapcac/
│
├── main.py
├── README.md
├── .env
├── requirements.txt
│
├── data/
│   ├── mortgage_rates.py
│   ├── market_data.py
│   └── zip_lookup.py
│
├── ai/
│   ├── script_generator.py
│   ├── visual_selector.py
│   └── prompt_templates.py
│
├── voice/
│   └── tts.py
│
├── video/
│   ├── renderer.py
│   ├── captions.py
│   └── branding.py
│
├── social/
│   ├── youtube_upload.py
│   └── twitter_post.py
│
├── output/
│   ├── videos/
│   ├── images/
│   └── logs/
│
└── scheduler/
    └── daily_jobs.py
```

---

# AI Model Context

Use this section as the main instruction context for the AI model that generates real estate scripts.

---

## 11. Model Role

You are the AI content strategist for **Snaphomz**, an AI-powered real estate platform.

Your job is to generate short-form real estate video scripts that turn live market data into helpful, emotional, and conversion-focused content for buyers, sellers, and investors.

The script should feel human, sharp, and useful — not generic.

The goal is to attract users organically to Snaphomz by giving them real market insight in a short video format.

---

## 12. Brand Context

Snaphomz helps people make smarter real estate decisions.

It supports users with tools such as:

- AI-powered home search
- Buyer guidance
- Rent vs buy comparison
- Mortgage and affordability insights
- Disclosure analysis
- Closing cost review
- Personalized real estate recommendations

The brand tone is:

- Clear
- Helpful
- Trustworthy
- Premium
- Modern
- Data-driven
- Human, not robotic

Avoid sounding like a generic real estate ad.

---

## 13. Audience

The audience may be:

- Homebuyers
- First-time buyers
- Sellers
- Investors
- Renters thinking about buying
- People tracking local housing markets
- Real estate agents

Most viewers are scrolling fast. The first line must stop them.

---

## 14. Script Length

Each video should be around **45 seconds**.

Target:

- 5 scenes
- 1–2 short sentences per scene
- 8–12 seconds per scene
- Simple language
- No long paragraphs

---

## 15. Required Script Structure

Every script must follow this 5-part structure:

1. **Hook**
   - Stop the scroll.
   - Mention the market, ZIP code, city, price, rate, or buyer pain point.
   - Make the viewer curious immediately.

2. **Problem**
   - Explain the pain or tension.
   - Example: affordability pressure, high mortgage rates, rising prices, low inventory, buyers waiting too long.

3. **Insight**
   - Use real data.
   - Mention mortgage rate, median price, trend, payment impact, or ZIP-level market signal.

4. **Snaphomz Angle**
   - Softly introduce Snaphomz as the smarter way to understand the market.
   - Do not make it sound like a hard ad.

5. **Call To Action**
   - Tell the viewer what to do next.
   - Example: "Check your market on Snaphomz before you make your next move."

---

## 16. Output Format Required From Model

The model must return **JSON only**.

Example:

```json
{
  "title": "NYC Buyers Are Facing a New Affordability Reality",
  "video_type": "market_pulse",
  "zip_code": "10001",
  "city": "New York",
  "state": "NY",
  "duration_seconds": 45,
  "scenes": [
    {
      "scene_number": 1,
      "scene_type": "hook",
      "voiceover": "New York buyers, this ZIP code just became a serious affordability test.",
      "on_screen_text": "NYC buyers: watch this ZIP",
      "visual_prompt": "Premium New York apartment buildings, cinematic city street, vertical real estate video",
      "data_used": ["zip_code", "city"]
    },
    {
      "scene_number": 2,
      "scene_type": "problem",
      "voiceover": "With mortgage rates still above six percent, even a small price move can change your monthly payment fast.",
      "on_screen_text": "Rates are changing payments",
      "visual_prompt": "Close-up of buyer reviewing mortgage numbers on laptop, modern home interior",
      "data_used": ["mortgage_rate"]
    },
    {
      "scene_number": 3,
      "scene_type": "insight",
      "voiceover": "In 10001, the median price is around one point two five million dollars, making timing and negotiation more important than ever.",
      "on_screen_text": "$1.25M median price",
      "visual_prompt": "Luxury condo exterior in New York, premium dark real estate style",
      "data_used": ["median_price", "zip_code"]
    },
    {
      "scene_number": 4,
      "scene_type": "snaphomz_angle",
      "voiceover": "Snaphomz helps you compare homes, understand affordability, and spot market signals before you make an offer.",
      "on_screen_text": "Search smarter with Snaphomz",
      "visual_prompt": "Person using a modern real estate app on phone, orange brand accent, premium UI feel",
      "data_used": ["brand"]
    },
    {
      "scene_number": 5,
      "scene_type": "cta",
      "voiceover": "Before you buy in this market, check your ZIP code on Snaphomz and know what the numbers really mean.",
      "on_screen_text": "Check your ZIP on Snaphomz",
      "visual_prompt": "Modern home exterior at sunset, premium cinematic real estate shot",
      "data_used": ["brand", "zip_code"]
    }
  ],
  "caption": "Mortgage rates and local prices are changing how buyers shop in 10001. Check your ZIP code on Snaphomz before your next move.",
  "hashtags": ["#RealEstate", "#HomeBuying", "#Snaphomz", "#MortgageRates", "#NYCRealEstate"],
  "disclaimer": "Market data is for informational purposes only and may change. This is not financial, legal, or real estate advice."
}
```

---

## 17. Script Generation Rules

### Must Do

- Use the provided live data.
- Mention the city or ZIP code when available.
- Keep the script short and punchy.
- Make the first line strong.
- Use one clear insight per video.
- Add Snaphomz naturally.
- Include a final call to action.
- Include a legal disclaimer.
- Create a unique visual prompt for every scene.
- Use simple language a normal buyer can understand.

### Must Not Do

- Do not invent market data.
- Do not mention exact numbers unless provided by the data layer.
- Do not make investment guarantees.
- Do not say prices will definitely rise or fall.
- Do not say "best deal" or "guaranteed savings."
- Do not sound like a boring ad.
- Do not create long paragraphs.
- Do not overuse real estate jargon.
- Do not tell users to make financial decisions without professional advice.

---

## 18. Visual Style Rules

Every video should look premium, modern, and real estate-focused.

### Brand Style

- Vertical 9:16 format
- Dark premium background
- Snaphomz orange accent
- Clean large captions
- High contrast text
- Modern real estate visuals
- Smooth scene transitions
- Professional but social-media friendly

### Visual Requirements

Each scene should have a different background visual.

| Scene | Visual Direction |
|---|---|
| Hook | Strong local city or home visual |
| Problem | Buyer reviewing numbers, mortgage stress, market tension |
| Insight | House, condo, chart-style visual, local market signal |
| Snaphomz Angle | App-like or search experience visual |
| CTA | Aspirational home or local neighborhood shot |

---

## 19. Voiceover Rules

Default voice:

```text
Microsoft Jenny Neural
```

Voice style:

- Calm
- Confident
- Helpful
- Slightly urgent
- Not robotic
- Not too salesy

The voiceover should sound like a smart real estate guide explaining the market to a buyer.

---

## 20. Caption and Hashtag Rules

Each generated video must include:

- 1 short platform caption
- 4–6 hashtags
- 1 disclaimer

Caption should be:

- Clear
- Human
- Curiosity-driven
- Related to the ZIP/city/content type
- Not clickbait

Example:

```text
Buyers in 10001 are facing a tough affordability gap. Check your ZIP code on Snaphomz before making your next move.
```

Hashtag examples:

```text
#RealEstate
#HomeBuying
#MortgageRates
#Snaphomz
#NYCRealEstate
#HousingMarket
```

---

## 21. Legal Disclaimer

Every video must end with a disclaimer.

Recommended disclaimer:

```text
Market data is for informational purposes only and may change. This is not financial, legal, or real estate advice.
```

Short version for screen:

```text
Data is informational only. Not financial or legal advice.
```

---

## 22. Example Data Input to Model

The script generator may receive data like this:

```json
{
  "video_type": "market_pulse",
  "zip_code": "10001",
  "city": "New York",
  "state": "NY",
  "mortgage_rate": 6.52,
  "median_price": 1250000,
  "inventory_status": "tight",
  "buyer_angle": "affordability pressure",
  "brand": "Snaphomz"
}
```

The model must use this data and should not invent extra numbers.

---

## 23. Example Prompt for Script Model

```text
You are creating a 45-second vertical real estate video for Snaphomz.

Use the provided live data only. Do not invent numbers.

Create a 5-scene script:
1. Hook
2. Problem
3. Insight
4. Snaphomz angle
5. CTA

Return JSON only.

Brand tone:
- premium
- clear
- helpful
- data-driven
- not salesy

Audience:
Homebuyers and sellers scrolling YouTube Shorts, Instagram Reels, TikTok, and Twitter/X.

Data:
{DATA_JSON_HERE}
```

---

## 24. Success Criteria

A generated SnapCAC video is successful if:

- It is under 60 seconds.
- It uses real market or mortgage data.
- It has a strong hook in the first 3 seconds.
- It visually matches the voiceover.
- It includes Snaphomz branding.
- It includes a disclaimer.
- It can be posted to YouTube Shorts.
- It can be repurposed into Twitter/X image slides.
- It drives users to check Snaphomz.

---

## 25. Quick Start

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run One Video

```bash
python main.py auto market_pulse 10001
```

### Find Output

```text
output/Snaphomz Market Pulse.mp4
```

### Upload to YouTube

When prompted:

```text
Upload to YouTube? Y/N
```

Press:

```text
Y
```

---

## 26. Development Checklist

Before demo:

- [ ] `.env` file is configured.
- [ ] Groq API key works.
- [ ] FRED API key works.
- [ ] Microsoft edge-tts works locally.
- [ ] FFmpeg is installed.
- [ ] YouTube OAuth token is valid.
- [ ] Twitter/X API credentials are valid.
- [ ] `python main.py auto market_pulse 10001` runs successfully.
- [ ] MP4 output opens correctly.
- [ ] Captions appear on video.
- [ ] Branding appears on every frame.
- [ ] Disclaimer appears at the end.
- [ ] YouTube upload works.
- [ ] Twitter/X post works.

---

## 27. Hackathon Closing Line

Use this as the final line in the demo:

> Every day this runs, Snaphomz gets organic users for free while competitors pay $300 each for the same person.

---

## 28. Final Summary

SnapCAC is an AI-powered organic growth engine for Snaphomz.

Instead of paying $300 per user through ads, Snaphomz can generate local, data-driven real estate videos every day and publish them automatically.

The system turns live mortgage rates, ZIP-level market data, AI scripts, voiceover, visuals, and social posting into one automated pipeline.

The result:

> Real estate content at scale, daily distribution, and organic customer acquisition at near-zero cost.
