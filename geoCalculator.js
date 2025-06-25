let map;
let route;
let fromMarker;
let toMarker;
let suggestFrom;
let suggestTo;

async function initMap() {
  await ymaps3.ready;
  const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } =
    ymaps3;
  const { YMapDefaultMarker } = await ymaps3.import(
    "@yandex/ymaps3-markers@0.0.1"
  );

  // Инициализация карты
  map = new YMap(document.getElementById("map"), {
    location: {
      center: [37.617644, 55.755819], // Москва по умолчанию
      zoom: 10,
    },
  });

  map.addChild(new YMapDefaultSchemeLayer({ theme: "dark" }));
  map.addChild(new YMapDefaultFeaturesLayer());

  // Инициализация suggest для полей ввода
  suggestFrom = new ymaps3.SuggestView("from");
  suggestTo = new ymaps3.SuggestView("to");

  // Обработчики для suggest
  suggestFrom.events.add("select", async function (e) {
    const selected = e.get("item");
    document.getElementById("from").value = selected.value;
    document.getElementById("from-suggestions").style.display = "none";

    // Удаляем старый маркер
    if (fromMarker) map.removeChild(fromMarker);

    // Добавляем новый маркер
    const coordinates = await geocode(selected.value);
    fromMarker = new YMapMarker(
      {
        coordinates: coordinates,
        title: selected.value,
      },
      new YMapDefaultMarker({
        color: "#00FF00",
        title: selected.value,
      })
    );
    map.addChild(fromMarker);

    // Центрируем карту
    map.setLocation({ center: coordinates, zoom: 12 });
  });

  suggestTo.events.add("select", async function (e) {
    const selected = e.get("item");
    document.getElementById("to").value = selected.value;
    document.getElementById("to-suggestions").style.display = "none";

    if (toMarker) map.removeChild(toMarker);

    const coordinates = await geocode(selected.value);
    toMarker = new YMapMarker(
      {
        coordinates: coordinates,
        title: selected.value,
      },
      new YMapDefaultMarker({
        color: "#FF0000",
        title: selected.value,
      })
    );
    map.addChild(toMarker);
  });

  // Показ suggest при вводе текста
  document.getElementById("from").addEventListener("input", function () {
    suggestFrom.search(this.value);
    document.getElementById("from-suggestions").style.display = "block";
  });

  document.getElementById("to").addEventListener("input", function () {
    suggestTo.search(this.value);
    document.getElementById("to-suggestions").style.display = "block";
  });

  // Обработчик кнопки построения маршрута
  document
    .getElementById("calculate-route")
    .addEventListener("click", calculateRoute);
}

// Функция геокодирования адреса
async function geocode(address) {
  const response = await ymaps3.geocode(address);
  const firstGeoObject = response.geoObjects.get(0);
  return firstGeoObject.geometry.getCoordinates();
}

// Функция построения маршрута
async function calculateRoute() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;

  if (!from || !to) {
    alert("Укажите точки маршрута!");
    return;
  }
  try {
    const fromCoords = await geocode(from);
    const toCoords = await geocode(to);

    // В версии 3.0 API маршрутизация пока недоступна напрямую
    alert(
      `Маршрут от ${from} до ${to} будет построен после реализации API маршрутизации`
    );
  } catch (error) {
    console.error("Ошибка построения маршрута:", error);
    alert("Не удалось построить маршрут. Проверьте адреса.");
  }
}

initMap();

function collectFormData() {
  return {
    from: document.getElementById("from").value,
    to: document.getElementById("to").value,
    weight: document.querySelector('input[placeholder="Вес, кг"]').value,
    volume: document.querySelector('input[placeholder="Объем, м3"]').value,
    phone: "",
    email: "",
  };
}

const modal = document.getElementById("modal");
const span = document.querySelector(".close");

function showModal(formData) {
  modal.style.display = "block";

  // Обработчик отправки данных
  document.getElementById("submit-data").onclick = async function () {
    formData.phone = document.getElementById("phone").value;
    formData.email = document.getElementById("email").value;

    if (!formData.phone || !formData.email) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    await sendToServer(formData);
    modal.style.display = "none";
  };
}

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

async function sendToServer(data) {
  try {
    const response = await fetch("http://localhost:3000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    if (response.ok) {
      alert("Данные успешно отправлены!");
    } else {
      throw new Error("Ошибка сервера");
    }
  } catch (error) {
    console.error("Ошибка:", error);
    alert("Произошла ошибка при отправке данных");
  }
}

function calculate() {
  const formData = collectFormData();
  if (!formData.from || !formData.to || !formData.weight || !formData.volume) {
    alert("Пожалуйста, заполните все поля формы");
    return;
  }
  //Заглушка: расстояние 500 км
  const fakeDistanceKm = 500;
  const pricePerKm = 30;
  const cost = fakeDistanceKm * pricePerKm;
  // Покажем стоимость в модальном окне
  const costOutput = document.getElementById("cost-output");
  if (costOutput) {
    costOutput.textContent = `Примерная стоимость: ${cost} ₽ (${fakeDistanceKm} км × ${pricePerKm} ₽/км)`;
  }
  showModal(formData);
}
