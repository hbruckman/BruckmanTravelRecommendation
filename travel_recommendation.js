// travel_recommendation.js

const DATA_URL = "travel_recommendation_api.json"; // same folder as HTML

let travelData = null;

async function loadData() {
  if (travelData) return travelData;

  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`Failed to fetch JSON: ${res.status}`);
  travelData = await res.json();

  // Task 6: verify access
  console.log("Fetched travel data:", travelData);

  return travelData;
}

// Utility: normalize keyword variations (Task 7)
function normalizeKeyword(raw) {
  const q = (raw || "").trim().toLowerCase();
  if (!q) return "";

  // accept singular/plural + casing
  if (q === "beach" || q === "beaches") return "beach";
  if (q === "temple" || q === "temples") return "temple";
  if (q === "country" || q === "countries") return "country";

  return q; // allow future extension
}

function getTimeForTimeZone(timeZone) {
  // Task 10 (optional)
  try {
    const options = {
      timeZone,
      hour12: true,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    return new Date().toLocaleTimeString("en-US", options);
  } catch {
    return null;
  }
}

function clearResults() {
  const resultsEl = document.getElementById("results");
  const titleEl = document.getElementById("resultsTitle");
  if (resultsEl) resultsEl.innerHTML = "";
  if (titleEl) titleEl.textContent = "Recommendations";
}

function renderResults(items, heading) {
  const resultsEl = document.getElementById("results");
  const titleEl = document.getElementById("resultsTitle");
  if (!resultsEl || !titleEl) return;

  titleEl.textContent = heading;

  if (!items || items.length === 0) {
    resultsEl.innerHTML = `<p style="color:#b9c4e2;margin:0;">No results found.</p>`;
    return;
  }

  resultsEl.innerHTML = items
    .map((item) => {
      const timeLine =
        item.timeZone
          ? (() => {
              const t = getTimeForTimeZone(item.timeZone);
              return t ? `<p class="meta">Local time: ${t}</p>` : "";
            })()
          : "";

      return `
        <article class="card">
          <img src="${item.imageUrl}" alt="${item.name}" />
          <div class="content">
            <h3>${item.name}</h3>
            ${timeLine}
            <p class="desc">${item.description}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

// Task 8: keyword-based recommendations
async function handleSearch(e) {
    e.preventDefault();
  const inputEl = document.getElementById("searchInput");
  const raw = inputEl ? inputEl.value : "";
  const keyword = normalizeKeyword(raw);

  if (!keyword) {
    renderResults([], "Recommendations");
    return;
  }

  const data = await loadData();

  // Assumes your JSON has top-level keys like: beaches, temples, countries
  // Example structure:
  // { "beaches":[...], "temples":[...], "countries":[...] }
  if (keyword === "beach") {
    renderResults((data.beaches || []).slice(0, 6), "Beach recommendations");
    return;
  }
  if (keyword === "temple") {
    renderResults((data.temples || []).slice(0, 6), "Temple recommendations");
    return;
  }
  if (keyword === "country") {
    // If countries contain nested places, flatten safely:
    // Example: { name, description, imageUrl, timeZone? }
    // or { name, cities:[{...}] }
    const countries = data.countries || [];
    const flattened = [];

    for (const c of countries) {
      if (c && Array.isArray(c.cities)) {
        for (const city of c.cities) {
          flattened.push({
            name: city.name || `${c.name} (city)`,
            description: city.description || c.description || "",
            imageUrl: city.imageUrl || c.imageUrl || "",
            timeZone: city.timeZone || c.timeZone,
          });
        }
      } else if (c) {
        flattened.push({
          name: c.name,
          description: c.description || "",
          imageUrl: c.imageUrl || "",
          timeZone: c.timeZone,
        });
      }
    }

    renderResults(flattened.slice(0, 6), "Country recommendations");
    return;
  }

  // Unknown keyword
  renderResults([], `Recommendations for “${raw}”`);
}

// Wire up buttons (Tasks 7 and 9)
document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("searchForm");
  const resetBtn = document.getElementById("resetBtn");

  if (searchForm) searchForm.addEventListener("submit", handleSearch);
  if (resetBtn) resetBtn.addEventListener("click", clearResults);

  // Optional: prevent real submit on contact form
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Message submitted (demo).");
      contactForm.reset();
    });
  }
});
