tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Courier Prime"', "monospace"],
        serif: ['"Old Standard TT"', "serif"],
      },
      colors: {
        paper: {
          DEFAULT: "#f3f0e6",
          dark: "#e3dfd0",
        },
        ink: {
          DEFAULT: "#2b2b2b",
          light: "#4a4a4a",
        },
        redaction: "#111111",
        stamp: "#b71c1c",
      },
      backgroundImage: {
        noise:
          "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.08%22/%3E%3C/svg%3E')",
      },
    },
  },
};


// Инициализация при загрузке
window.addEventListener("load", function () {
  // Инициализация иконок
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Интерактивность для плейсхолдеров
  document.querySelectorAll(".chart-placeholder").forEach((el) => {
    el.addEventListener("click", function () {
      const stamp = document.createElement("div");
      stamp.classList.add(
        "stamp-box",
        "absolute",
        "text-2xl",
        "top-1/2",
        "left-1/2",
        "-translate-x-1/2",
        "-translate-y-1/2",
        "rotate-[-12deg]",
        "z-50",
        "bg-paper/90",
      );
      stamp.innerText = "ACCESS DENIED";
      stamp.style.pointerEvents = "none";

      if (!this.querySelector(".stamp-box")) {
        this.parentElement.style.position = "relative";
        this.parentElement.appendChild(stamp);
        setTimeout(() => stamp.remove(), 1000);
      }
    });
  });
});
