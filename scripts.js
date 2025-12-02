
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
// 图片数据管理类
class ImageModal {
    constructor() {
        this.images = [];  // 存储所有图片数据
        this.currentIndex = 0;  // 当前显示图片的索引
        this.init();  // 立即初始化
    }
    
    init() {
        this.collectImages();  // 收集页面中的所有图片
        this.bindEvents();  // 绑定所有事件监听器
    }
    
    // 收集页面中所有可点击的图片
    collectImages() {
        const clickableImages = document.querySelectorAll('.clickable-image');
        this.images = Array.from(clickableImages).map((img, index) => ({
            thumbnail: img.src,  // 缩略图地址
            fullsize: img.getAttribute('data-fullsize') || img.src,  // 大图地址（优先使用data-fullsize属性）
            title: img.alt || `图片 ${index + 1}`,  // 图片标题（使用alt属性）
            element: img  // 图片DOM元素引用
        }));
    }
    
    // 绑定所有事件监听器
    bindEvents() {
        // 为每个图片添加点击事件
        this.images.forEach((image, index) => {
            image.element.addEventListener('click', () => {
                this.openModal(index);  // 点击图片时打开模态框
            });
        });
        
        // 模态框控制按钮事件
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        document.getElementById('modalPrev').addEventListener('click', () => this.prevImage());
        document.getElementById('modalNext').addEventListener('click', () => this.nextImage());
        
        // 键盘导航支持
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 点击模态框背景关闭（但不是点击内容区域）
        document.getElementById('imageModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();  // 只有点击背景才关闭
            }
        });
    }
    
    // 打开模态框显示指定图片
    openModal(index) {
        this.currentIndex = index;
        const modal = document.getElementById('imageModal');
        const expandedImage = document.getElementById('expandedImage');
        const caption = document.getElementById('imageCaption');
        
        // 预加载大图后再显示（避免显示空白）
        this.preloadImage(this.images[index].fullsize).then(() => {
            expandedImage.src = this.images[index].fullsize;
            caption.textContent = this.images[index].title;
            modal.style.display = 'flex';  // 显示模态框
            document.body.classList.add('modal-open');  // 禁止页面滚动
        });
    }
    
    // 关闭模态框
    closeModal() {
        const modal = document.getElementById('imageModal');
        modal.style.display = 'none';  // 隐藏模态框
        document.body.classList.remove('modal-open');  // 恢复页面滚动
    }
    
    // 显示上一张图片
    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateModalContent();
    }
    
    // 显示下一张图片
    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateModalContent();
    }
    
    // 更新模态框中的图片和标题
    updateModalContent() {
        const expandedImage = document.getElementById('expandedImage');
        const caption = document.getElementById('imageCaption');
        
        // 添加淡出过渡效果
        expandedImage.style.opacity = '0';
        
        this.preloadImage(this.images[this.currentIndex].fullsize).then(() => {
            setTimeout(() => {
                expandedImage.src = this.images[this.currentIndex].fullsize;
                caption.textContent = this.images[this.currentIndex].title;
                expandedImage.style.opacity = '1';  // 淡入显示新图片
            }, 200);
        });
    }
    
    // 预加载图片（提升用户体验）
    preloadImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();  // 图片加载完成后解析Promise
            img.onerror = () => resolve();  // 即使加载失败也继续执行
            img.src = src;
        });
    }
    
    // 处理键盘事件
    handleKeyPress(event) {
        const modal = document.getElementById('imageModal');
        if (modal.style.display === 'flex') {  // 只有模态框打开时才处理
            switch(event.key) {
                case 'Escape':  // ESC键关闭模态框
                    this.closeModal();
                    break;
                case 'ArrowLeft':  // 左箭头显示上一张
                    this.prevImage();
                    break;
                case 'ArrowRight':  // 右箭头显示下一张
                    this.nextImage();
                    break;
            }
        }
    }
}

  // 初始化图片模态框功能（仅在select works页面）
  const selectWorksPage = document.querySelector('.page-select-works');
  if (selectWorksPage && document.querySelector('.clickable-image')) {
      new ImageModal();
  }
});
