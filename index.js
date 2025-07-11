const API_URL = "https://striveschool-api.herokuapp.com/api/product/";
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODcwYjkwNjc4Y2RkZjAwMTU1ZDY3OTkiLCJpYXQiOjE3NTIyMTc4NjIsImV4cCI6MTc1MzQyNzQ2Mn0.8pSfpw5H462iIUTYWmR6RBt8VA3-pHPhh8z3Enbsrx4";

const loader = document.getElementById("loader");
const productsList = document.getElementById("products-list");
const alertContainer = document.getElementById("alert-container");
const cartCount = document.getElementById("cart-count");
const cartItemsDiv = document.getElementById("cart-items");
const cartTotalSpan = document.getElementById("cart-total");

function showLoader(show) {
  loader.style.display = show ? "block" : "none";
}

function showAlert(message, type = "danger") {
  alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => (alertContainer.innerHTML = ""), 3000);
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function setCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  if (cart.length > 0) {
    cartCount.style.display = "inline-block";
    cartCount.textContent = cart.reduce((acc, p) => acc + p.qty, 0);
  } else {
    cartCount.style.display = "none";
  }
}

function productCard(product) {
  return `
    <div class="col-md-4">
      <div class="card card-tech border-danger border-3 bg-dark text-light h-100 position-relative">
        <span class="badge bg-danger position-absolute top-0 start-0 m-2" style="font-size:0.9rem;">Nintendo</span>
        <img src="${product.imageUrl}" class="card-img-top p-2" alt="${
    product.name
  }" style="object-fit:cover; height:220px; background:#fff; border-radius:1rem; border:4px solid #fff;">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title fw-bold text-danger" style="font-size:1.3rem;">${
            product.name
          }</h5>
          <p class="card-text small">${product.description}</p>
          <p class="card-text mb-1"><strong>Brand:</strong> <span class="text-danger">${
            product.brand
          }</span></p>
          <p class="card-text mb-2"><strong>Prezzo:</strong> <span class="text-warning">€${
            product.price
          }</span></p>
          <div class="mt-auto d-flex gap-2 flex-wrap">
            <button class="btn btn-light btn-sm text-danger border-danger" onclick="showDetail('${
              product._id
            }')">Dettaglio</button>
            <button class="btn btn-outline-light btn-sm" onclick='addToCart(${JSON.stringify(
              product
            )})'>Aggiungi al carrello</button>
            <button class="btn btn-warning btn-sm text-dark" onclick="editFromHome('${
              product._id
            }')">Modifica</button>
          </div>
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
    productsList.innerHTML = products.map(productCard).join("");
  } catch (e) {
    showAlert(e.message);
  } finally {
    showLoader(false);
  }
}

window.showDetail = async function (id) {
  showLoader(true);
  try {
    const res = await fetch(API_URL + id, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    if (!res.ok) throw new Error("Errore nel caricamento dettaglio");
    const p = await res.json();
    document.getElementById("product-detail").innerHTML = `
      <img src="${p.imageUrl}" class="img-fluid mb-3" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.description}</p>
      <p><strong>Brand:</strong> ${p.brand}</p>
      <p><strong>Prezzo:</strong> €${p.price}</p>
      <p><small>Creato il: ${new Date(p.createdAt).toLocaleString()}</small></p>
    `;
    new bootstrap.Modal(document.getElementById("productDetailModal")).show();
  } catch (e) {
    showAlert(e.message);
  } finally {
    showLoader(false);
  }
};

window.addToCart = function (product) {
  const cart = getCart();
  const idx = cart.findIndex((p) => p._id === product._id);
  if (idx > -1) {
    cart[idx].qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  setCart(cart);
  showAlert("Prodotto aggiunto al carrello!", "success");
};

window.editFromHome = function (id) {
  localStorage.setItem("editProductId", id);
  window.location.href = "backoffice.html";
};

function renderCart() {
  const cart = getCart();
  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p class="text-center">Il carrello è vuoto.</p>';
    cartTotalSpan.textContent = "€0";
    return;
  }
  let total = 0;
  cartItemsDiv.innerHTML = cart
    .map((item, i) => {
      const subtotal = item.price * item.qty;
      total += subtotal;
      return `
      <div class="d-flex align-items-center border-bottom py-2 gap-3">
        <img src="${item.imageUrl}" alt="${item.name}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;">
        <div class="flex-grow-1">
          <div><strong>${item.name}</strong></div>
          <div class="small text-secondary">${item.brand}</div>
          <div class="small">Prezzo: €${item.price} x ${item.qty}</div>
        </div>
        <div class="me-2">€${subtotal}</div>
        <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart('${item._id}')">&times;</button>
      </div>
    `;
    })
    .join("");
  cartTotalSpan.textContent = `€${total}`;
}

window.removeFromCart = function (id) {
  let cart = getCart();
  cart = cart.filter((p) => p._id !== id);
  setCart(cart);
  renderCart();
};

// Aggiorna badge e carrello quando si apre il modal
const cartModal = document.getElementById("cartModal");
if (cartModal) {
  cartModal.addEventListener("show.bs.modal", renderCart);
}

updateCartBadge();
fetchProducts();
