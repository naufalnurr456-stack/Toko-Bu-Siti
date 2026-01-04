// Cart Management Functions
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContainer = document.getElementById("cart-items");
  const emptyCart = document.getElementById("empty-cart");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (cart.length === 0) {
    cartContainer.innerHTML = "";
    if (emptyCart) emptyCart.style.display = "block";
    if (checkoutBtn) checkoutBtn.disabled = true;
    updateSummary(0);
    return;
  }

  if (emptyCart) emptyCart.style.display = "none";
  if (checkoutBtn) checkoutBtn.disabled = false;

  let html = "";
  let subtotal = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    html += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h5>${item.name}</h5>
                    <div class="price">Rp ${item.price.toLocaleString()}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="btn-qty minus" data-id="${item.id}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" value="${
                      item.quantity
                    }" min="1" max="10" 
                           data-id="${item.id}" class="qty-input">
                    <button class="btn-qty plus" data-id="${item.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="cart-item-total">
                    Rp ${itemTotal.toLocaleString()}
                </div>
                <div class="cart-item-remove">
                    <button class="btn-remove" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
  });

  cartContainer.innerHTML = html;
  updateSummary(subtotal);

  // Add event listeners
  addCartEventListeners();
}

function updateSummary(subtotal) {
  const shipping = 10000;
  const total = subtotal + shipping;

  document.getElementById(
    "subtotal"
  ).textContent = `Rp ${subtotal.toLocaleString()}`;
  document.getElementById(
    "shipping"
  ).textContent = `Rp ${shipping.toLocaleString()}`;
  document.getElementById("total").textContent = `Rp ${total.toLocaleString()}`;
}

function addCartEventListeners() {
  // Quantity minus buttons
  document.querySelectorAll(".btn-qty.minus").forEach((button) => {
    button.addEventListener("click", function () {
      const id = parseInt(this.dataset.id);
      const input = document.querySelector(`.qty-input[data-id="${id}"]`);
      const currentValue = parseInt(input.value);
      if (currentValue > 1) {
        input.value = currentValue - 1;
        updateCartQuantity(id, currentValue - 1);
      }
    });
  });

  // Quantity plus buttons
  document.querySelectorAll(".btn-qty.plus").forEach((button) => {
    button.addEventListener("click", function () {
      const id = parseInt(this.dataset.id);
      const input = document.querySelector(`.qty-input[data-id="${id}"]`);
      const currentValue = parseInt(input.value);
      if (currentValue < 10) {
        input.value = currentValue + 1;
        updateCartQuantity(id, currentValue + 1);
      }
    });
  });

  // Quantity input change
  document.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("change", function () {
      const id = parseInt(this.dataset.id);
      const newValue = parseInt(this.value);
      if (newValue >= 1 && newValue <= 10) {
        updateCartQuantity(id, newValue);
      } else {
        this.value = 1;
        updateCartQuantity(id, 1);
      }
    });
  });

  // Remove buttons
  document.querySelectorAll(".btn-remove").forEach((button) => {
    button.addEventListener("click", function () {
      const id = parseInt(this.dataset.id);
      removeCartItem(id);
    });
  });

  // Checkout button
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      if (cart.length > 0) {
        localStorage.setItem(
          "checkoutData",
          JSON.stringify({
            items: cart,
            subtotal: cart.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            ),
            shipping: 10000,
            total:
              cart.reduce((sum, item) => sum + item.price * item.quantity, 0) +
              10000,
          })
        );
        window.location.href = "checkout.html";
      }
    });
  }
}

function updateCartQuantity(productId, quantity) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cart.find((item) => item.id === productId);

  if (item) {
    item.quantity = quantity;
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
  }
}

function removeCartItem(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();

  // Update cart count in navbar
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
  }
}

// Initialize cart when page loads
document.addEventListener("DOMContentLoaded", function () {
  loadCart();

  // Update cart count in navbar
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    cartCount.textContent = count;
  }
});
// Di file cart.js, TAMBAHKAN function ini:

function proceedToCheckout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Keranjang kosong! Silakan tambahkan produk terlebih dahulu.");
    return;
  }

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 10000; // Flat shipping fee
  const total = subtotal + shipping;

  // Prepare checkout data
  const checkoutData = {
    items: cart,
    subtotal: subtotal,
    shipping: shipping,
    total: total,
  };

  // Save checkout data
  localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

  // Redirect to checkout page
  window.location.href = "checkout.html";
}

// Update event listener untuk checkout button
document.addEventListener("DOMContentLoaded", function () {
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", proceedToCheckout);
  }
});
