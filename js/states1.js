  // 設定最新年份基準 (預設以清單中最大年份為準，例如 2052)
  const LATEST_YEAR = 2052;
  const DISPLAY_YEARS_LIMIT = 5; // 限制只顯示近 5 年

  // 網頁載入完成後自動過濾：超過 5 年自動隱藏
  document.addEventListener("DOMContentLoaded", function() {
    filterRecentYears();
  });

  function filterRecentYears() {
    const items = document.querySelectorAll(".stats-item");
    
    items.forEach(item => {
      const itemYear = parseInt(item.getAttribute("data-year"));
      
      // 比對年份：若早於 (最新年份 - 5)，則自動隱藏
      if (LATEST_YEAR - itemYear >= DISPLAY_YEARS_LIMIT) {
        item.classList.add("hidden");
      } else {
        item.classList.remove("hidden");
      }
    });
  }

  // 搜尋與選單觸發邏輯
  function handleSearch() {
    const inputVal = document.getElementById("yearInput").value.trim();
    const selectVal = document.getElementById("yearSelect").value;
    const targetYear = inputVal || selectVal;

    if (!targetYear) {
      alert("請輸入或選擇要搜尋的年份！");
      return;
    }

    const targetNum = parseInt(targetYear);
    const items = document.querySelectorAll(".stats-item");
    let found = false;

    items.forEach(item => {
      const itemYear = parseInt(item.getAttribute("data-year"));
      
      // 如果搜尋符合特定年份，將該項目顯示出來並高亮
      if (itemYear === targetNum) {
        item.classList.remove("hidden");
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        item.style.backgroundColor = "#fef08a"; // 搜尋高亮提示
        setTimeout(() => { item.style.backgroundColor = ""; }, 2500);
        found = true;
      }
    });

    if (!found) {
      // 若清單無靜態預設，直接帶參數跳轉至詳細成績頁面
      window.location.href = `batting-${targetYear}.html`;
    }
  }
