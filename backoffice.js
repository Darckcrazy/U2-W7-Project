const API_URL = "https://striveschool-api.herokuapp.com/api/product/";
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODcwYjkwNjc4Y2RkZjAwMTU1ZDY3OTkiLCJpYXQiOjE3NTIyMTc4NjIsImV4cCI6MTc1MzQyNzQ2Mn0.8pSfpw5H462iIUTYWmR6RBt8VA3-pHPhh8z3Enbsrx4";

const loader = document.getElementById("loader");
const productsList = document.getElementById("products-list");
const alertContainer = document.getElementById("alert-container");
const form = document.getElementById("product-form");
const resetBtn = document.getElementById("reset-btn");

function showLoader(show) {
  loader.style.display = show ? "block" : "none";
}

function showAlert(message, type = "danger") {
  alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => (alertContainer.innerHTML = ""), 3000);
}

function productCard(product) {
  return `
    <div class="col-md-4">
      <div class="card bg-secondary text-light h-100">
        <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}">
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">${product.description}</p>
          <p class="card-text"><strong>Brand:</strong> ${product.brand}</p>
          <p class="card-text"><strong>Prezzo:</strong> €${product.price}</p>
          <button class="btn btn-info mb-2" onclick="editProduct('${product._id}')">Modifica</button>
          <button class="btn btn-danger" onclick="confirmDelete('${product._id}')">Elimina</button>
        </div>
      </div>
    </div>
  `;
}

async function fetchProducts() {
  showLoader(true);
  try {
    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    if (!res.ok) throw new Error("Errore nel caricamento prodotti");
    const products = await res.json();
    // Se non ci sono prodotti, esegui il seed
    if (products.length === 0) {
      await seedProducts();
      return fetchProducts();
    }
    productsList.innerHTML = products.map(productCard).join("");
  } catch (e) {
    showAlert(e.message);
  } finally {
    showLoader(false);
  }
}

async function seedProducts() {
  const nintendoProducts = [
    {
      name: "Nintendo Switch OLED",
      description: "La console Nintendo Switch con schermo OLED da 7 pollici.",
      brand: "Nintendo",
      imageUrl:
        "https://m.media-amazon.com/images/I/61-PblYntsL._AC_SL1500_.jpg",
      price: 349,
    },
    {
      name: "Nintendo Switch Lite",
      description: "La console portatile compatta per giocare ovunque.",
      brand: "Nintendo",
      imageUrl:
        "https://m.media-amazon.com/images/I/61kRkfsIMUL._AC_SL1500_.jpg",
      price: 219,
    },
    {
      name: "The Legend of Zelda: Tears of the Kingdom",
      description: "L'epica avventura open world di Link su Nintendo Switch.",
      brand: "Nintendo",
      imageUrl:
        "https://m.media-amazon.com/images/I/81p+xe8cbnL._AC_SL1500_.jpg",
      price: 59,
    },
    {
      name: "Super Mario Odyssey",
      description: "Un viaggio 3D con Mario in mondi incredibili.",
      brand: "Nintendo",
      imageUrl:
        "https://m.media-amazon.com/images/I/81QpkIctqPL._AC_SL1500_.jpg",
      price: 49,
    },
    {
      name: "Pokémon Scarlatto",
      description: "Nuova avventura Pokémon nella regione di Paldea.",
      brand: "Nintendo",
      imageUrl:
        "https://m.media-amazon.com/images/I/81v6KQ2A2GL._AC_SL1500_.jpg",
      price: 59,
    },
    {
      name: "Joy-Con (L/R) Rosso Neon/Blu Neon",
      description: "Coppia di controller Joy-Con per Nintendo Switch.",
      brand: "Nintendo",
      imageUrl:
        "https://m.media-amazon.com/images/I/61uA2UVnYWL._AC_SL1500_.jpg",
      price: 79,
    },
  ];
  for (const prod of nintendoProducts) {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(prod),
    });
  }
}

window.editProduct = async function (id) {
  showLoader(true);
  try {
    const res = await fetch(API_URL + id, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    if (!res.ok) throw new Error("Errore nel caricamento prodotto");
    const p = await res.json();
    form["product-id"].value = p._id;
    form["name"].value = p.name;
    form["description"].value = p.description;
    form["brand"].value = p.brand;
    form["imageUrl"].value = p.imageUrl;
    form["price"].value = p.price;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {
    showAlert(e.message);
  } finally {
    showLoader(false);
  }
};

window.confirmDelete = function (id) {
  document.getElementById("confirm-message").textContent =
    "Sei sicuro di voler eliminare questo prodotto?";
  const modal = new bootstrap.Modal(document.getElementById("confirmModal"));
  modal.show();
  document.getElementById("confirm-yes").onclick = async function () {
    modal.hide();
    await deleteProduct(id);
  };
};

async function deleteProduct(id) {
  showLoader(true);
  try {
    const res = await fetch(API_URL + id, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    if (!res.ok) throw new Error("Errore nell'eliminazione");
    showAlert("Prodotto eliminato!", "success");
    fetchProducts();
    form.reset();
  } catch (e) {
    showAlert(e.message);
  } finally {
    showLoader(false);
  }
}

form.onsubmit = async function (e) {
  e.preventDefault();
  // Validazione base
  const name = form["name"].value.trim();
  const description = form["description"].value.trim();
  const brand = form["brand"].value.trim();
  const imageUrl = form["imageUrl"].value.trim();
  const price = form["price"].value.trim();
  if (!name || !description || !brand || !imageUrl || !price) {
    showAlert("Tutti i campi sono obbligatori!");
    return;
  }
  const product = { name, description, brand, imageUrl, price: Number(price) };
  const id = form["product-id"].value;
  showLoader(true);
  try {
    let res;
    if (id) {
      // Modifica
      res = await fetch(API_URL + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error("Errore nella modifica");
      showAlert("Prodotto modificato!", "success");
    } else {
      // Crea nuovo
      res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error("Errore nella creazione");
      showAlert("Prodotto creato!", "success");
    }
    fetchProducts();
    form.reset();
    form["product-id"].value = "";
  } catch (e) {
    showAlert(e.message);
  } finally {
    showLoader(false);
  }
};

resetBtn.onclick = function () {
  document.getElementById("confirm-message").textContent =
    "Vuoi davvero resettare il form?";
  const modal = new bootstrap.Modal(document.getElementById("confirmModal"));
  modal.show();
  document.getElementById("confirm-yes").onclick = function () {
    modal.hide();
    form.reset();
    form["product-id"].value = "";
  };
};

window.addEventListener("DOMContentLoaded", () => {
  const editId = localStorage.getItem("editProductId");
  if (editId) {
    editProduct(editId);
    localStorage.removeItem("editProductId");
  }
});

fetchProducts();
