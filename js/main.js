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

  const SHEET_ID = "1GUBiauEJ4sAC4PTZrZVT09B4ap7vk5gRAkIS5q-uqbY";
  const API_URL = `https://opensheet.elk.sh/${SHEET_ID}/${currentYear}`;

  async function loadData() {
    try {
      const response = await fetch(API_URL);
      const rawData = await response.json();

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
      renderTable();
    } catch (err) {
      console.error("載入失敗：", err);
      document.getElementById("statsBody").innerHTML = 
        `<tr><td colspan="21" style="padding: 30px; color: #ef4444;">資料讀取失敗，請確認 SHEET_ID 與 Google Sheet 發布設定。</td></tr>`;
    }
  }

  function initTableHeader() {
    const tr = document.getElementById("tableHeader");
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
    const onlyQualified = document.getElementById("qualifiedFilter").checked;
    const tbody = document.getElementById("statsBody");
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

  loadData();
