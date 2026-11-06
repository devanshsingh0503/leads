# ⚡ LeadPulse USA — Small Business Website Leads & Outreach Dashboard

A modern web dashboard for discovering, tracking, and executing cold outreach to high-ticket, underrated US small businesses that need new websites, redesigns, speed optimization, and critical fixes.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Focus](https://img.shields.io/badge/focus-US%20Small%20Businesses-orange.svg)

---

## 🚀 Key Features

* **💎 High-Ticket & Underrated Niches:** Curated opportunities across roofing & storm contractors, cosmetic MedSpas, ceramic auto detailing, luxury landscaping, boutique law firms, commercial bakeries, and pet resorts.
* **👤 Direct Decision-Maker Contacts:** Includes owner/founder names, direct business emails, phone numbers, and active websites.
* **💬 1-Click WhatsApp Direct:** Click to immediately launch a WhatsApp chat (`wa.me`) with a pre-filled, personalized opening icebreaker.
* **📧 Ready-To-Send Cold Email Pitches:** Complete email templates with compelling subject lines, specific observations of their website bottlenecks, and low-friction CTAs.
* **🏷️ Fast Search & Filtering:** Filter instantly by industry (Home Services, MedSpa, Auto, Legal, Food, Pet Care, Fitness) or outreach status (Uncontacted, Contacted, Saved).
* **💾 Automatic Persistence:** Track outreach progress (`⚪ Uncontacted`, `🟢 Contacted`, `⭐ Saved / Follow-Up`); all updates persist locally in browser storage.
* **📥 CSV Export:** Export all leads with full contact info and pitch templates into a spreadsheet with one click.

---

## 📂 Repository Structure

| File | Description |
|---|---|
| [`index.html`](index.html) | Dashboard UI with live stats, search bar, filters, and cards. |
| [`style.css`](style.css) | Dark theme styling, glassmorphism, responsive grid, and badges. |
| [`app.js`](app.js) | Dynamic rendering, search/filter algorithms, clipboard copy, and CSV exporter. |
| [`leads.json`](leads.json) | Curated dataset of active leads with verified contact details. |
| [`sync_leads.py`](sync_leads.py) | Python script to fetch fresh leads from public APIs and job boards. |
| [`start.bat`](start.bat) | One-click Windows desktop launcher. |

---

## 🛠️ Quick Start

### 1. Direct Browser Launch
Open `index.html` directly in any web browser, or double-click `start.bat`.

### 2. Run Local Server
```bash
# Python 3
python -m http.server 8080

# Then open in your browser:
http://localhost:8080
```

---

## 📈 Outreach Workflow

1. Filter by your preferred niche (e.g., *Home Services* or *MedSpa*).
2. Review the **Why This Is An Underrated Opportunity** callout to understand their exact technical and business bottlenecks.
3. Switch between **💬 WhatsApp / SMS Line** and **📧 Cold Email Pitch**.
4. Click **Copy First Line** or **Launch WhatsApp Pitch** to send your message.
5. Update status dropdown to **🟢 Contacted** to keep your pipeline organized.

---

## 📜 License
MIT License. Free to use and customize for your own outreach agency or freelancing pipeline.
