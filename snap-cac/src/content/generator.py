import anthropic
import json
import os
from src.data.fetcher import CONTENT_TEMPLATES


def generate_script(data: dict, content_type: str, api_key: str) -> dict:
    client = anthropic.Anthropic(api_key=api_key)

    rate = data["rates"]
    market = data["market"]
    school = data["schools"]
    tip = data["tip"]
    template = CONTENT_TEMPLATES[content_type]

    context_map = {
        "rate_alert": f"""
Mortgage rate data:
- Current 30yr fixed rate: {rate['rate']}%
- Previous week: {rate['previous']}%
- Change: {rate['change']:+.2f}% ({rate['direction']})
- Date: {rate['date']}

Market: {market['city']}, median price ${market['median_price']:,}

Hook to use: "{template['hook']}"
CTA to use: "{template['cta']}"
""",
        "market_update": f"""
Market data for {market['city']} (ZIP {data['zip']}):
- Median price: ${market['median_price']:,}
- Active inventory: {market['inventory']} homes
- Days on market: {market['days_on_market']} days
- Year-over-year change: +{market['yoy_change']}%
- Current mortgage rate: {rate['rate']}%

Hook to use: "{template['hook']}"
CTA to use: "{template['cta']}"
""",
        "school_spotlight": f"""
School data for ZIP {data['zip']}:
- Top school: {school['top_school']}
- Rating: {school['rating']}/10
- District: {school['district']}
- College readiness: {school['college_readiness']}%
- Avg nearby school rating: {school['avg_rating_nearby']}/10

Market context: Homes near top-rated schools avg 15-25% premium.
Current mortgage rate: {rate['rate']}%

Hook to use: "{template['hook']}"
CTA to use: "{template['cta']}"
""",
        "buyer_tip": f"""
Buyer tip to explain:
- Tip: {tip['tip']}
- Potential savings: {tip['savings']}

Current market context:
- Mortgage rate: {rate['rate']}%
- Market: {market['city']}, median ${market['median_price']:,}

Hook to use: "{template['hook']}"
CTA to use: "{template['cta']}"
"""
    }

    prompt = f"""You are a real estate content creator for Snaphomz, a US real estate platform.

Create a short-form video script (TikTok/Instagram Reels/YouTube Shorts) using this data:

{context_map[content_type]}

Rules:
- Max 60 seconds when spoken (roughly 150 words)
- Start with the exact hook provided
- Use the real data naturally in the script
- Sound like a knowledgeable friend, not a salesperson
- End with the exact CTA provided
- No emojis in the script itself (they go in captions)
- Be specific with numbers — vague claims lose viewers

Return JSON only:
{{
  "script": "full spoken script here",
  "caption": "social media caption with emojis and hashtags (max 200 chars)",
  "hashtags": ["list", "of", "10", "hashtags"],
  "title": "video title (max 60 chars)",
  "thumbnail_text": "3-5 words for thumbnail overlay"
}}"""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.strip()

    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    return json.loads(raw)


def generate_image_prompt(script_data: dict, content_type: str) -> str:
    prompts = {
        "rate_alert": f"Modern American house with 'RATE ALERT' text overlay, professional real estate photography, bright daylight, suburban neighborhood, clean and trustworthy aesthetic",
        "market_update": f"Aerial view of American suburban neighborhood, real estate market visualization, clean infographic style, professional photography",
        "school_spotlight": f"Happy family in front of beautiful American home near school, bright sunny day, suburban neighborhood, aspirational lifestyle photography",
        "buyer_tip": f"Young couple receiving keys to new home, smiling, professional real estate photography, warm lighting, celebratory moment"
    }
    return prompts.get(content_type, prompts["market_update"])
