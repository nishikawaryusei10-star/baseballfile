const QUALIFIED_PA = 465;

const columns = [
  { key: "name", label: "球員", align: "text-center", stickyClass: "col-sticky-1" },
  { key: "team", label: "隊伍", align: "text-center", stickyClass: "col-sticky-2" },
  { key: "g", label: "G", align: "text-center" },
  { key: "pa", label: "PA", align: "text-center" },
  { key: "ab", label: "AB", align: "text-center" },
  { key: "h", label: "H", align: "text-center" },
  { key: "2b", label: "2B", align: "text-center" },
  { key: "3b", label: "3B", align: "text-center" },
  { key: "hr", label: "HR", align: "text-center"},
  { key: "rbi", label: "RBI", align: "text-center" },
  { key: "r", label: "R", align: "text-center" },
  { key: "sb", label: "SB", align: "text-center" },
  { key: "tb", label: "TB", align: "text-center" },
  { key: "so", label: "SO", align: "text-center" },
  { key: "bb", label: "BB", align: "text-center" },
  { key: "sac", label: "SAC", align: "text-center" },
  { key: "sf", label: "SF", align: "text-center" },
  { key: "avg", label: "AVG", align: "text-center" },
  { key: "obp", label: "OBP", align: "text-center" },
  { key: "slg", label: "SLG", align: "text-center" },
  { key: "ops", label: "OPS", align: "text-center"}
];

let currentSortKey = "hr";
let isDesc = true;
let players = [];

// CSV 強效解析器（處理逗號與雙引號）
function parseCSV(text) {
  const lines = text.split(/\r\n|\n/);
  const result = [];
  
  for (let line of lines) {
    if (!line.trim()) continue;
    const row = [];
    let insideQuote = false;
    let entry = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        row.push(entry.trim().replace(/^"|"$/g, ''));
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim().replace(/^"|"$/g, ''));
    result.push(row);
  }
  return result;
}

async function loadData() {
  const titleElem = document.querySelector("h1");
  const titleText = titleElem ? titleElem.innerText : "";
  const yearMatch = titleText.match(/\d+/);
  const currentYear = yearMatch ? yearMatch[0] : "2051";

  const SHEET_ID = "1GUBiauEJ4sAC4PTZrZVT09B4ap7vk5gRAkIS5q-uqbY";
  const API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${currentYear}`;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP 錯誤：${response.status}`);
    
    const csvData = await response.text();
    const rows = parseCSV(csvData);

    if (rows.length < 2) throw new Error("試算表中沒有足夠的資料");

    const headers = rows[0];
    const rawData = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || "";
      });
      return obj;
    });

    players = rawData.map(item => ({
      name: (item["球員姓名"] || item["球員"] || item["Name"] || "-").toString().trim(),
      team: (item["隊伍"] || item["球隊"] || item["Team"] || "-").toString().trim(),
      g: parseInt(item["G"]) || 0,
      pa: parseInt(item["PA"]) || 0,
      ab: parseInt(item["AB"]) || 0,
      h: parseInt(item["H"]) || 0,
      "2b": parseInt(item["2B"]) || 0,
      "3b": parseInt(item["3B"]) || 0,
      hr: parseInt(item["HR"]) || 0,
      rbi: parseInt(item["RBI"]) || 0,
      r: parseInt(item["R"]) || 0,
      sb: parseInt(item["SB"]) || 0,
      tb: parseInt(item["TB"]) || 0,
      so: parseInt(item["SO"]) || 0,
      bb: parseInt(item["BB"]) || 0,
      sac: parseInt(item["SAC"]) || 0,
      sf: parseInt(item["SF"]) || 0,
      avg: parseFloat(item["AVG"]) || 0,
      obp: parseFloat(item["OBP"]) || 0,
      slg: parseFloat(item["SLG"]) || 0,
      ops: parseFloat(item["OPS"]) || 0
    }));

    initTableHeader();
    renderLeaders(); // 渲染數據領先榜
    renderTable();    // 渲染總表格
  } catch (err) {
    console.error("載入失敗：", err);
    const tbody = document.getElementById("statsBody");
    if (tbody) {
      tbody.innerHTML = 
        `<tr><td colspan="21" style="padding: 30px; color: #ef4444; text-align: center;">資料讀取失敗，請確認 Google Sheet 中有名為「${currentYear}」的分頁。</td></tr>`;
    }
  }
}

// 自動計算並渲染頂部 1~5 名數據榜
// 自動計算並渲染頂部數據榜與聯盟平均三圍
function renderLeaders() {
  const container = document.getElementById("leadersContainer");
  if (!container || players.length === 0) return;

  // 1. 計算聯盟整體打擊三圍 (加權平均：總安打/總打數、總上壘/總打席等)
  const totalH = players.reduce((sum, p) => sum + p.h, 0);
  const totalAB = players.reduce((sum, p) => sum + p.ab, 0);
  const totalBB = players.reduce((sum, p) => sum + p.bb, 0);
  const totalSF = players.reduce((sum, p) => sum + p.sf, 0);
  const totalPA = players.reduce((sum, p) => sum + p.pa, 0);
  const totalTB = players.reduce((sum, p) => sum + p.tb, 0);

  // 聯盟加權計算
  const lgAvg = totalAB > 0 ? totalH / totalAB : 0;
  const lgObp = (totalAB + totalBB + totalSF) > 0 ? (totalH + totalBB) / (totalAB + totalBB + totalSF) : 0;
  const lgSlg = totalAB > 0 ? totalTB / totalAB : 0;
  const lgOps = lgObp + lgSlg;

  // 生成「聯盟平均打擊三圍」卡片 HTML
  let html = `
    <div class="leader-card" style="border-top: 3px solid #10b981;">
      <h3>
        📊 聯盟平均打擊三圍
        <span class="note">全聯盟數據</span>
      </h3>
      <ul class="leader-list" style="padding-top: 4px;">
        <li class="leader-item">
          <span class="leader-player">打擊率 (AVG)</span>
          <span class="leader-val">${formatRate(lgAvg)}</span>
        </li>
        <li class="leader-item">
          <span class="leader-player">上壘率 (OBP)</span>
          <span class="leader-val">${formatRate(lgObp)}</span>
        </li>
        <li class="leader-item">
          <span class="leader-player">長打率 (SLG)</span>
          <span class="leader-val">${formatRate(lgSlg)}</span>
        </li>
        <li class="leader-item">
          <span class="leader-player">整體攻擊物料 (OPS)</span>
          <span class="leader-val" style="color:#10b981;">${formatRate(lgOps)}</span>
        </li>
        <li class="leader-item">
          <span class="leader-player">總對戰人次 / 總打席</span>
          <span class="leader-val" style="color:#64748b; font-size: 0.85rem;">${totalPA} PA</span>
        </li>
      </ul>
    </div>
  `;

  // 2. 各分項數據排行榜設定
  const categories = [
    { title: "打擊率 (AVG)", key: "avg", isRate: true, needQualified: true },
    { title: "上壘率 (OBP)", key: "obp", isRate: true, needQualified: true },
    { title: "整體攻擊物料 (OPS)", key: "ops", isRate: true, needQualified: true },
    { title: "安打 (H)", key: "h", isRate: false, needQualified: false },
    { title: "全壘打 (HR)", key: "hr", isRate: false, needQualified: false },
    { title: "打點 (RBI)", key: "rbi", isRate: false, needQualified: false },
    { title: "盜壘 (SB)", key: "sb", isRate: false, needQualified: false }
  ];

  // 渲染排行榜卡片
  categories.forEach(cat => {
    let pool = players.filter(p => cat.needQualified ? p.pa >= QUALIFIED_PA : true);
    pool.sort((a, b) => b[cat.key] - a[cat.key]);
    const top5 = pool.slice(0, 5);

    html += `
      <div class="leader-card">
        <h3>
          ${cat.title}
          ${cat.needQualified ? `<span class="note">≥${QUALIFIED_PA}PA</span>` : ""}
        </h3>
        <ul class="leader-list">
          ${top5.map((p, index) => `
            <li class="leader-item">
              <span class="leader-rank ${index === 0 ? 'top1' : ''}">${index + 1}</span>
              <span class="leader-player">${p.name}<span class="leader-team">(${p.team})</span></span>
              <span class="leader-val">${cat.isRate ? formatRate(p[cat.key]) : p[cat.key]}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  });

  container.innerHTML = html;
}

function initTableHeader() {
  const tr = document.getElementById("tableHeader");
  if (!tr) return;
  tr.innerHTML = "";
  columns.forEach(col => {
    const th = document.createElement("th");
    const isSorted = currentSortKey === col.key;
    const stickyClass = col.stickyClass || "";
    th.className = `${col.align} ${stickyClass} ${isSorted ? 'sorted' : ''}`;
    th.innerHTML = `${col.label}${isSorted ? (isDesc ? " ↓" : " ↑") : ""}`;
    th.onclick = () => sortTable(col.key);
    tr.appendChild(th);
  });
}

function sortTable(key) {
  if (currentSortKey === key) {
    isDesc = !isDesc;
  } else {
    currentSortKey = key;
    isDesc = true;
  }
  initTableHeader();
  renderTable();
}

function formatRate(val) {
  if (isNaN(val) || val === 0) return ".000";
  let str = val.toFixed(3);
  return str.startsWith("0") ? str.substring(1) : str;
}

function renderTable() {
  const filterElem = document.getElementById("qualifiedFilter");
  const onlyQualified = filterElem ? filterElem.checked : false;
  const tbody = document.getElementById("statsBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  let filtered = players.filter(p => onlyQualified ? p.pa >= QUALIFIED_PA : true);

  filtered.sort((a, b) => {
    let valA = a[currentSortKey];
    let valB = b[currentSortKey];
    if (typeof valA === "string") {
      return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
    }
    return isDesc ? valB - valA : valA - valB;
  });

  filtered.forEach(p => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="col-sticky-1 bold-cell">${p.name}</td>
      <td class="col-sticky-2" style="color: var(--text-muted);">${p.team}</td>
      <td class="num">${p.g}</td>
      <td class="num">${p.pa}</td>
      <td class="num">${p.ab}</td>
      <td class="num">${p.h}</td>
      <td class="num">${p["2b"]}</td>
      <td class="num">${p["3b"]}</td>
      <td class="num">${p.hr}</td>
      <td class="num">${p.rbi}</td>
      <td class="num">${p.r}</td>
      <td class="num">${p.sb}</td>
      <td class="num">${p.tb}</td>
      <td class="num">${p.so}</td>
      <td class="num">${p.bb}</td>
      <td class="num">${p.sac}</td>
      <td class="num">${p.sf}</td>
      <td class="num">${formatRate(p.avg)}</td>
      <td class="num">${formatRate(p.obp)}</td>
      <td class="num">${formatRate(p.slg)}</td>
      <td class="num">${formatRate(p.ops)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// 確保載入順序無虞
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", loadData);
} else {
  loadData();
}
