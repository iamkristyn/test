
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

    // ===== Lightbox for Select Works =====
  const swPage = document.querySelector("body.page-select-works");
  if (swPage) {
    const swItems = Array.from(document.querySelectorAll(".select-works-grid .sw-item"));

    if (swItems.length > 0) {
      const lightbox = document.querySelector("[data-lightbox]");
      const lbImg = lightbox.querySelector("[data-lightbox-img]");
      const lbCaption = lightbox.querySelector("[data-lightbox-caption]");
      const btnClose = lightbox.querySelector(".sw-lightbox-close");
      const btnPrev = lightbox.querySelector(".sw-lightbox-prev");
      const btnNext = lightbox.querySelector(".sw-lightbox-next");

      // 把每一张图的 src / caption 收集起来
      const slides = swItems.map(item => {
        const img = item.querySelector("img");
        const captionEl = item.querySelector(".sw-caption");
        const caption = captionEl
          ? captionEl.textContent.trim()
          : (img.alt || "");
        return {
          img,
          caption
        };
      });

      let currentIndex = 0;
      let touchStartX = 0;

      function openLightbox(index) {
        currentIndex = index;
        const { img, caption } = slides[currentIndex];

        lbImg.src = img.src;
        lbImg.alt = img.alt || "";
        lbCaption.textContent = caption;

        lightbox.classList.add("is-open");
        // 阻止背景滚动
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
      }

      function closeLightbox() {
        lightbox.classList.remove("is-open");
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }

      function showPrev() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        openLightbox(currentIndex);
      }

      function showNext() {
        currentIndex = (currentIndex + 1) % slides.length;
        openLightbox(currentIndex);
      }

      // 点击缩略图打开
      swItems.forEach((item, index) => {
        item.addEventListener("click", () => {
          openLightbox(index);
        });
      });

      // 按钮事件
      btnClose.addEventListener("click", closeLightbox);
      btnPrev.addEventListener("click", showPrev);
      btnNext.addEventListener("click", showNext);

      // 点击背景关闭（但点到内容区域不要关）
      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
          closeLightbox();
        }
      });

      // 键盘：Esc 关闭，左右切图
      document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("is-open")) return;

        if (e.key === "Escape") {
          closeLightbox();
        } else if (e.key === "ArrowLeft") {
          showPrev();
        } else if (e.key === "ArrowRight") {
          showNext();
        }
      });

      // 触摸滑动：左右切图（手机 / 平板）
      lightbox.addEventListener("touchstart", (e) => {
        if (!lightbox.classList.contains("is-open")) return;
        if (e.changedTouches && e.changedTouches.length > 0) {
          touchStartX = e.changedTouches[0].clientX;
        }
      }, { passive: true });

      lightbox.addEventListener("touchend", (e) => {
        if (!lightbox.classList.contains("is-open")) return;
        if (e.changedTouches && e.changedTouches.length > 0) {
          const endX = e.changedTouches[0].clientX;
          const deltaX = endX - touchStartX;

          if (Math.abs(deltaX) > 50) { // 滑动距离阈值
            if (deltaX < 0) {
              showNext();
            } else {
              showPrev();
            }
          }
        }
      }, { passive: true });
    }
  }
 
});
