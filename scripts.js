
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  // ===== Theme toggle =====
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const storedTheme = window.localStorage.getItem("kristyn-theme");

  if (storedTheme === "dark" || storedTheme === "light") {
    body.setAttribute("data-theme", storedTheme);
  } else {
    body.setAttribute("data-theme", "light");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = body.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      body.setAttribute("data-theme", next);
      window.localStorage.setItem("kristyn-theme", next);
    });
  }

  // ===== Index page interactions (grid/list + filters) =====
  const indexRoot = document.querySelector("[data-page='index']");
  if (indexRoot) {
    const outerSection = indexRoot.querySelector(".projects-section");
    const gridWrapper = indexRoot.querySelector(".projects-grid");
    const listWrapper = indexRoot.querySelector(".list-wrapper");

    const viewButtons = indexRoot.querySelectorAll("[data-view]");
    const filterButtons = indexRoot.querySelectorAll("[data-filter]");

    const projectCards = indexRoot.querySelectorAll(".project-card");
    const projectRows = indexRoot.querySelectorAll(".project-row");

    const listPreviewImg = indexRoot.querySelector(".list-preview img");

    function setView(view) {
      if (!outerSection) return;
      if (view === "list") {
        outerSection.classList.add("view-list");
      } else {
        outerSection.classList.remove("view-list");
      }
      viewButtons.forEach(btn => {
        btn.classList.toggle("is-active", btn.dataset.view === view);
      });
    }

    function itemMatchesFilter(el, filter) {
      if (!filter || filter === "all") return true;
      const cat = (el.getAttribute("data-category") || "").toLowerCase();
      return cat.split(",").map(s => s.trim()).includes(filter);
    }

    function applyFilter(filter) {
      projectCards.forEach(card => {
        card.style.display = itemMatchesFilter(card, filter) ? "" : "none";
      });

      projectRows.forEach(row => {
        row.style.display = itemMatchesFilter(row, filter) ? "grid" : "none";
      });

      filterButtons.forEach(btn => {
        btn.classList.toggle("is-active", btn.dataset.filter === filter);
      });

      // seed preview with first visible row
      if (listPreviewImg) {
        const first = Array.from(projectRows).find(r => r.style.display !== "none");
        if (first && first.dataset.preview) {
          listPreviewImg.src = first.dataset.preview;
        }
      }
    }

    // Attach events
    viewButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        setView(btn.dataset.view);
      });
    });

    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        applyFilter(btn.dataset.filter);
      });
    });

    // Hover image update for list
    if (listPreviewImg) {
      projectRows.forEach(row => {
        row.addEventListener("mouseenter", () => {
          const src = row.dataset.preview;
          if (src) listPreviewImg.src = src;
        });
      });
    }

    // Defaults
    setView("grid");
    applyFilter("all");
  }
  
  // ===== Select Works page – modal images =====
  if (body.classList.contains("page-select-works")) {
    const swItems = document.querySelectorAll(".sw-item");
    const modal = document.getElementById("sw-modal");
    const modalImg = modal?.querySelector(".sw-modal-image");
    const modalText = modal?.querySelector(".sw-modal-text");
    const modalClose = modal?.querySelector(".sw-modal-close");

    if (!modal || !modalImg || !modalText || !modalClose) return;

    function openModal(imgSrc, imgAlt, captionText) {
      modalImg.src = imgSrc;
      modalImg.alt = imgAlt || "";
      modalText.textContent = captionText || "";
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      // 禁止页面在模态框打开时滚动（体验更好）
      body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      modalImg.src = "";
      body.style.overflow = ""; // 恢复滚动
    }

    // 为每一个缩略图绑定点击事件
    swItems.forEach(item => {
      item.addEventListener("click", () => {
        const img = item.querySelector("img");
        const caption = item.querySelector(".sw-caption");
        if (!img) return;

        const imgSrc = img.getAttribute("src");
        const imgAlt = img.getAttribute("alt") || "";
        const captionText = caption ? caption.textContent.trim() : "";

        if (imgSrc) {
          openModal(imgSrc, imgAlt, captionText);
        }
      });
    });

    // 点击关闭按钮关闭
    modalClose.addEventListener("click", () => {
      closeModal();
    });

    // 点击背景区域（遮罩层）关闭
    modal.addEventListener("click", (event) => {
      // 只有点在最外层背景上，才关闭；避免点在内容区也关闭
      if (event.target === modal) {
        closeModal();
      }
    });

    // 按下 Esc 键关闭
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });
  }
  
});
