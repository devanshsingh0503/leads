import urllib.request
import json
import datetime
import os

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LeadScanner/2.0'}

SEARCH_TERMS = [
    'build website small business', 'website redesign', 'fix website bug',
    'wordpress website', 'shopify store', 'squarespace website', 'contractor website'
]

def fetch_fresh_leads():
    seen_ids = set()
    leads = []
    now = datetime.datetime.now(datetime.timezone.utc).timestamp()

    for term in SEARCH_TERMS:
        url = f"https://www.freelancer.com/api/projects/0.1/projects/active?query={urllib.request.quote(term)}&limit=40&compact=false"
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                for p in data.get('result', {}).get('projects', []):
                    pid = p.get('id')
                    if pid in seen_ids:
                        continue
                    seen_ids.add(pid)

                    curr = p.get('currency', {})
                    if curr.get('country') != 'US' and curr.get('code') != 'USD':
                        continue

                    sub_time = p.get('submitdate', 0)
                    hours_ago = (now - sub_time) / 3600
                    if hours_ago > 24:
                        continue

                    title = p.get('title', '')
                    desc = p.get('preview_description', '') or p.get('description', '')
                    text_lower = (title + ' ' + desc).lower()

                    exclude = ['looking for work', 'for hire', 'commission only', 'crypto', 'memecoin', 'spelling', 'click-through', 'survey']
                    if any(e in text_lower for e in exclude):
                        continue

                    include = ['website', 'wordpress', 'shopify', 'wix', 'squarespace', 'frontend', 'landing page', 'redesign', 'fix bug']
                    if not any(i in text_lower for i in include):
                        continue

                    budget = p.get('budget', {})
                    min_b = budget.get('minimum')
                    max_b = budget.get('maximum')
                    b_str = f"${int(min_b)} - ${int(max_b)} USD" if min_b and max_b else (f"${int(min_b)}+ USD" if min_b else "Fixed / Hourly")

                    # Generate dynamic first line
                    first_line = f"Hi! I saw your post regarding '{title}'—I specialize in building and fixing high-performing small business websites and would love to help you get this resolved cleanly."

                    leads.append({
                        "id": f"lead-{pid}",
                        "title": title,
                        "clientName": "Small Business Owner",
                        "location": "United States",
                        "category": "Website Project",
                        "type": "Direct Client",
                        "budget": b_str,
                        "postedTime": f"{round(hours_ago, 1)} hours ago",
                        "hoursAgo": round(hours_ago, 1),
                        "source": "Direct Post",
                        "originalUrl": f"https://www.freelancer.com/projects/{p.get('seo_url')}",
                        "whatTheyNeed": desc[:250] + ("..." if len(desc) > 250 else ""),
                        "highlights": ["Mobile responsiveness", "Fast turnaround", "Clean UI/UX"],
                        "firstLine": first_line,
                        "status": "New",
                        "tags": ["US Lead", "Website", "Fresh"]
                    })
        except Exception as e:
            print(f"Error fetching {term}: {e}")

    if leads:
        curr_dir = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(curr_dir, 'leads.json')
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(leads[:15], f, indent=2)
        print(f"Successfully synced {len(leads[:15])} fresh leads to leads.json")
    else:
        print("No new leads fetched, keeping existing feed.")

if __name__ == '__main__':
    fetch_fresh_leads()
