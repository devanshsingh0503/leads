// Leads Dashboard Application Logic
let leadsData = [];
let activeCategoryFilter = "all";
let activeStatusFilter = "all";
let searchQuery = "";
const activeOutreachTab = {}; // leadId -> 'wa' | 'email'

// Initialize Application
document.addEventListener("DOMContentLoaded", async () => {
  await loadLeads();
  setupEventListeners();
  renderDashboard();
});

// Load Leads from localStorage, leads.json, or embedded fallback
async function loadLeads() {
  // Check if user has updated schema in local storage
  const cached = localStorage.getItem("daily_website_leads_v2");
  if (cached) {
    try {
      leadsData = JSON.parse(cached);
      return;
    } catch (e) {
      console.warn("Failed to parse cached leads, loading fresh copy.", e);
    }
  }

  try {
    const response = await fetch("leads.json");
    if (!response.ok) throw new Error("HTTP error " + response.status);
    leadsData = await response.json();
    saveToStorage();
  } catch (error) {
    console.warn("Fetch failed, reading embedded data:", error);
    const embedded = document.getElementById("embedded-leads");
    if (embedded && embedded.textContent) {
      try {
        leadsData = JSON.parse(embedded.textContent);
        saveToStorage();
      } catch (err) {
        console.error("Failed to parse embedded leads", err);
      }
    }
  }
}

function saveToStorage() {
  localStorage.setItem("daily_website_leads_v2", JSON.stringify(leadsData));
}

// Setup Interactive Controls
function setupEventListeners() {
  // Search Input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderDashboard();
    });
  }

  // Category Pills
  const categoryPills = document.querySelectorAll(".category-pill");
  categoryPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      categoryPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      activeCategoryFilter = pill.dataset.category;
      renderDashboard();
    });
  });

  // Status Pills
  const statusPills = document.querySelectorAll(".status-pill");
  statusPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      statusPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      activeStatusFilter = pill.dataset.status;
      renderDashboard();
    });
  });

  // Export to CSV
  const btnExport = document.getElementById("btnExport");
  if (btnExport) {
    btnExport.addEventListener("click", exportToCSV);
  }

  // Reset / Refresh from JSON
  const btnRefresh = document.getElementById("btnRefresh");
  if (btnRefresh) {
    btnRefresh.addEventListener("click", async () => {
      btnRefresh.innerHTML = "⏳ Refreshing...";
      try {
        const response = await fetch("leads.json");
        leadsData = await response.json();
        saveToStorage();
        renderDashboard();
        showToast("Leads synced from latest dataset!");
      } catch (err) {
        const embedded = document.getElementById("embedded-leads");
        if (embedded && embedded.textContent) {
          leadsData = JSON.parse(embedded.textContent);
          saveToStorage();
          renderDashboard();
          showToast("Leads refreshed from local backup!");
        } else {
          showToast("Error syncing leads");
        }
      } finally {
        btnRefresh.innerHTML = "🔄 Refresh Feed";
      }
    });
  }
}

// Render Dashboard Grid & Stats
function renderDashboard() {
  updateStats();
  renderCards();
}

function updateStats() {
  const totalEl = document.getElementById("statTotal");
  const freshEl = document.getElementById("statFresh");
  const contactedEl = document.getElementById("statContacted");
  const highIntentEl = document.getElementById("statHighIntent");

  const total = leadsData.length;
  const verifiedContact = leadsData.filter((l) => l.email && l.phone).length;
  const contacted = leadsData.filter((l) => l.status === "Contacted").length;
  const highTicket = leadsData.filter((l) => l.budget && l.budget.includes("$")).length;

  if (totalEl) totalEl.textContent = total;
  if (freshEl) freshEl.textContent = verifiedContact; // Displays verified phone & email count
  if (contactedEl) contactedEl.textContent = contacted;
  if (highIntentEl) highIntentEl.textContent = highTicket;
}

function getFilteredLeads() {
  return leadsData.filter((lead) => {
    // Category match
    const categoryMatch =
      activeCategoryFilter === "all" ||
      lead.niche.toLowerCase().includes(activeCategoryFilter.toLowerCase()) ||
      lead.category.toLowerCase().includes(activeCategoryFilter.toLowerCase());

    // Status match
    const statusMatch =
      activeStatusFilter === "all" ||
      lead.status.toLowerCase() === activeStatusFilter.toLowerCase();

    // Search query match
    const searchMatch =
      !searchQuery ||
      lead.title.toLowerCase().includes(searchQuery) ||
      lead.clientName.toLowerCase().includes(searchQuery) ||
      lead.ownerName.toLowerCase().includes(searchQuery) ||
      lead.location.toLowerCase().includes(searchQuery) ||
      lead.email.toLowerCase().includes(searchQuery) ||
      lead.phone.toLowerCase().includes(searchQuery) ||
      lead.whatTheyNeed.toLowerCase().includes(searchQuery) ||
      lead.tags.some((t) => t.toLowerCase().includes(searchQuery));

    return categoryMatch && statusMatch && searchMatch;
  });
}

function renderCards() {
  const container = document.getElementById("leadsGrid");
  if (!container) return;

  const filtered = getFilteredLeads();

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">No matching leads found</div>
        <p>Try clearing your search query or switching filters to see more leads.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map((lead) => {
      // Determine category badge class
      let badgeClass = "badge-build";
      const cat = (lead.category + " " + lead.niche).toLowerCase();
      if (cat.includes("redesign") || cat.includes("interior") || cat.includes("luxury")) badgeClass = "badge-redesign";
      else if (cat.includes("fix") || cat.includes("plumbing") || cat.includes("contracting")) badgeClass = "badge-fix";
      else if (cat.includes("catering") || cat.includes("bakery") || cat.includes("auto")) badgeClass = "badge-ecommerce";

      // Status card modifier class
      let statusClass = "";
      if (lead.status === "Contacted") statusClass = "status-contacted";
      else if (lead.status === "Saved") statusClass = "status-saved";

      const currentTab = activeOutreachTab[lead.id] || "wa";

      return `
        <article class="lead-card ${statusClass}" id="card-${lead.id}">
          <div class="card-top">
            <span class="card-category-badge ${badgeClass}">${escapeHtml(lead.niche)}</span>
            <span class="card-time">⚡ Underrated Goldmine</span>
          </div>

          <div>
            <h3 class="lead-title">${escapeHtml(lead.title)}</h3>
            <div class="lead-meta">
              <span class="meta-item">📍 <strong>${escapeHtml(lead.location)}</strong></span>
              <span class="meta-item meta-highlight">💰 Budget: ${escapeHtml(lead.budget)}</span>
              <span class="meta-item">🏷️ ${escapeHtml(lead.type)}</span>
            </div>
          </div>

          <!-- Direct Verified Contact Info Box -->
          <div class="contact-info-box">
            <div class="contact-header">
              <span>Verified Decision Maker</span>
              <span style="color:#10b981; font-weight:700;">● Active Channel</span>
            </div>
            <div class="decision-maker">
              👤 ${escapeHtml(lead.ownerName)}
            </div>
            
            <div class="contact-action-row">
              <a href="${escapeHtml(lead.whatsappUrl)}" target="_blank" rel="noopener noreferrer" class="btn-contact btn-whatsapp" title="Open WhatsApp Chat">
                💬 WhatsApp (${escapeHtml(lead.phone)})
              </a>
              <a href="mailto:${escapeHtml(lead.email)}?subject=${encodeURIComponent(lead.emailSubject)}" class="btn-contact btn-email" title="Compose Email">
                📧 ${escapeHtml(lead.email)}
              </a>
              <button class="btn-contact btn-web" onclick="copyToClipboard('${escapeHtml(lead.email)}', 'Email copied!')" title="Copy Email Address">
                📋 Copy Email
              </button>
              <a href="tel:${escapeHtml(lead.phone.replace(/[^0-9+]/g, ''))}" class="btn-contact btn-call" title="Call Direct">
                📞 Call
              </a>
              <a href="${escapeHtml(lead.websiteUrl)}" target="_blank" rel="noopener noreferrer" class="btn-contact btn-web" title="Visit Current Website">
                🌐 Current Site ↗
              </a>
            </div>
          </div>

          <!-- Why Underrated Callout -->
          <div class="underrated-box">
            <div class="underrated-title">💎 Why This Is An Underrated Opportunity</div>
            <div>${escapeHtml(lead.whyUnderrated)}</div>
          </div>

          <!-- What They Need Breakdown -->
          <div class="need-box">
            <div class="need-title">🎯 Scope & High-Value Fixes Needed</div>
            <p class="need-text">${escapeHtml(lead.whatTheyNeed)}</p>
            <ul class="highlights-list">
              ${lead.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}
            </ul>
          </div>

          <!-- Tabbed Outreach Icebreaker & Email Pitch -->
          <div class="outreach-container">
            <div class="outreach-nav">
              <div class="outreach-tabs">
                <button class="tab-btn ${currentTab === "wa" ? "active" : ""}" onclick="switchTab('${lead.id}', 'wa')">
                  💬 WhatsApp / SMS Line
                </button>
                <button class="tab-btn ${currentTab === "email" ? "active" : ""}" onclick="switchTab('${lead.id}', 'email')">
                  📧 Cold Email Pitch
                </button>
              </div>

              ${
                currentTab === "wa"
                  ? `<button class="btn-copy-mini" onclick="copyIcebreaker('${lead.id}')">📋 Copy First Line</button>`
                  : `<button class="btn-copy-mini" onclick="copyFullEmail('${lead.id}')">📋 Copy Full Email</button>`
              }
            </div>

            <div class="outreach-content-pane">
              ${
                currentTab === "wa"
                  ? `<p class="icebreaker-text" id="text-${lead.id}">"${escapeHtml(lead.firstLine)}"</p>`
                  : `
                    <div class="email-preview-wrapper" id="email-${lead.id}">
                      <div class="email-subject"><strong>Subject:</strong> ${escapeHtml(lead.emailSubject)}</div>
                      <div class="email-body">${escapeHtml(lead.emailBody)}</div>
                    </div>
                  `
              }
            </div>
          </div>

          <div class="lead-tags">
            ${lead.tags.map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join("")}
          </div>

          <!-- Bottom Actions -->
          <div class="card-actions">
            <div>
              <select class="status-dropdown" onchange="updateLeadStatus('${lead.id}', this.value)">
                <option value="New" ${lead.status === "New" ? "selected" : ""}>⚪ Status: Uncontacted</option>
                <option value="Contacted" ${lead.status === "Contacted" ? "selected" : ""}>🟢 Contacted</option>
                <option value="Saved" ${lead.status === "Saved" ? "selected" : ""}>⭐ Saved / Follow-Up</option>
              </select>
            </div>

            <a href="${escapeHtml(lead.whatsappUrl)}" target="_blank" rel="noopener noreferrer" class="btn-open-wa">
              Launch WhatsApp Pitch 🚀
            </a>
          </div>
        </article>
      `;
    })
    .join("");
}

// Switch outreach tab between WhatsApp and Cold Email
window.switchTab = function (leadId, tab) {
  activeOutreachTab[leadId] = tab;
  renderCards();
};

// Update lead status
window.updateLeadStatus = function (leadId, newStatus) {
  const lead = leadsData.find((l) => l.id === leadId);
  if (lead) {
    lead.status = newStatus;
    saveToStorage();
    renderDashboard();
    showToast(`Marked "${lead.clientName}" as ${newStatus}`);
  }
};

// Copy Icebreaker text to clipboard
window.copyIcebreaker = function (leadId) {
  const lead = leadsData.find((l) => l.id === leadId);
  if (!lead) return;
  copyToClipboard(lead.firstLine, "WhatsApp opening line copied!");
};

// Copy Full Email (Subject + Body) to clipboard
window.copyFullEmail = function (leadId) {
  const lead = leadsData.find((l) => l.id === leadId);
  if (!lead) return;
  const fullText = `Subject: ${lead.emailSubject}\n\n${lead.emailBody}`;
  copyToClipboard(fullText, "Full cold email template copied!");
};

// Generic copy to clipboard helper
window.copyToClipboard = function (text, successMsg) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showToast(successMsg || "Copied to clipboard!");
    })
    .catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showToast(successMsg || "Copied!");
    });
};

// Toast notification helper
function showToast(message) {
  let toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span>⚡</span><span>${escapeHtml(message)}</span>`;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

// Export leads as CSV with all contact information
function exportToCSV() {
  if (!leadsData || leadsData.length === 0) {
    showToast("No leads to export");
    return;
  }

  const headers = [
    "ID",
    "Company Name",
    "Decision Maker",
    "Location",
    "Niche",
    "Email",
    "Phone / WhatsApp",
    "Website",
    "Budget",
    "Status",
    "Why Underrated",
    "WhatsApp First Line",
    "Email Subject",
    "Email Body"
  ];

  const rows = leadsData.map((l) => [
    `"${l.id}"`,
    `"${l.clientName.replace(/"/g, '""')}"`,
    `"${l.ownerName.replace(/"/g, '""')}"`,
    `"${l.location.replace(/"/g, '""')}"`,
    `"${l.niche.replace(/"/g, '""')}"`,
    `"${l.email.replace(/"/g, '""')}"`,
    `"${l.phone.replace(/"/g, '""')}"`,
    `"${l.websiteUrl.replace(/"/g, '""')}"`,
    `"${l.budget.replace(/"/g, '""')}"`,
    `"${l.status}"`,
    `"${(l.whyUnderrated || "").replace(/"/g, '""')}"`,
    `"${l.firstLine.replace(/"/g, '""')}"`,
    `"${(l.emailSubject || "").replace(/"/g, '""')}"`,
    `"${(l.emailBody || "").replace(/"/g, '""')}"`
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `underrated_us_leads_contacts_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("Exported all leads with contact info to CSV!");
}

// Utility: Escape HTML
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
