const timeout = 120000;

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  const header = document.querySelector("header");
  const delay = 1000;

  loader.classList.add("active");

  setTimeout(() => {
    loader.classList.add("hide");

    loader.addEventListener(
      "transitionend",
      () => {
        loader.remove();
        document.body.style.overflow = "auto";
        header.classList.add("visible");
      },
      { once: true }
    );
  }, delay);
});

document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll("nav a");
  const sections = document.querySelectorAll("section[id]");
  const header = document.querySelector("header");
  const headerHeight = header.offsetHeight;

  const updateUrlHash = (hash) => {
    if (history.pushState) {
      history.pushState(null, null, hash);
    } else {
      window.location.hash = hash;
    }
  };

  // Создаем якорь для главной страницы
  const mainAnchor = document.createElement("div");
  mainAnchor.id = "main-anchor";
  mainAnchor.style.position = "absolute";
  mainAnchor.style.top = "0";
  mainAnchor.style.height = "1px";
  document.body.prepend(mainAnchor);

  // IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: `${headerHeight}px`,
    threshold: [0.2],
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const id = entry.target.id;
      const link =
        id === "main-anchor"
          ? document.querySelector('nav a[href="#main"]')
          : document.querySelector(`nav a[href="#${id}"]`);

      if (link) {
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        updateUrlHash(`#${id}`);
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
  observer.observe(mainAnchor);

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const target = document.querySelector(targetId);

      if (target) {
        window.scrollTo({
          top: target.offsetTop - headerHeight,
          behavior: "smooth"
        });

        updateUrlHash(targetId);
      }
    });
  });
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      window.scrollTo({
        top: target.offsetTop - headerHeight,
        behavior: "auto",
      });
    }
  } else if (window.scrollY <= headerHeight) {
    document.querySelector('nav a[href="#main"]')?.classList.add("active");
  }
  document.body.addEventListener("click", function (e) {
    const btn = e.target.closest(".calculate");
    if (btn && btn.id !== "calculate-route") {
      const header = document.querySelector("header");
      const headerHeight = header ? header.offsetHeight : 0;
      const target = document.querySelector("#delivery");

      if (!target) return;

      const offsetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth"
      });
    }
  });
  function showCostInModal(distanceKm) {
    const cost = Math.round(distanceKm * 30);
    const costOutput = document.getElementById("cost-output");
    costOutput.textContent = `Примерная стоимость: ${cost} ₽ (${distanceKm.toFixed(1)} км × 30 ₽/км)`;
    document.getElementById("modal").style.display = "block";
  }
  const calcButton = document.getElementById("calculate-route");
  if (calcButton) {
    calcButton.addEventListener("click", function () {
      const from = document.getElementById("from").value;
      const to = document.getElementById("to").value;
      if (!from || !to) {
        alert("Пожалуйста, укажите и пункт отправления, и пункт назначения.");
        return;
      }
      ymaps.ready().then(() => {
        ymaps.route([from, to])
          .then(function (route) {
            const distanceMeters = route.getLength();
            const distanceKm = distanceMeters / 1000;
            showCostInModal(distanceKm);
          })
          .catch(function (error) {
            alert("Не удалось рассчитать маршрут. Проверьте введённые адреса.");
            console.error(error);
          });
      });
    });
  }
  const closeBtn = document.querySelector(".modal .close");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      document.getElementById("modal").style.display = "none";
    });
  }
});
