// Data Produk
const products = {
  1: {
    id: 1,
    name: "Kue Sagon Original",
    price: 25000,
    image: "img/produk sagonoriginal.jpg",
    description:
      "Kue sagon original dengan kelapa parut Kelapa parut tua disangrai dengan perpaduan rasa manis dan gurih. Dibuat dengan resep turun temurun.",
    rating: 4.5,
    reviews: 128,
    stock: 50,
  },
  2: {
    id: 2,
    name: "Kue Sagon Coklat",
    price: 30000,
    image: "img/produk sagoncoklat.jpg",
    description:
      "Perpaduan coklat premium dengan kelapa parut. Rasa manis yang pas dan tekstur renyah.",
    rating: 5,
    reviews: 96,
    stock: 35,
  },
  3: {
    id: 3,
    name: "Kue Sagon Keju",
    price: 30000,
    image: "img/produk sagonkeju.jpg",
    description: "Kue Sagon dengan cita rasa keju . Cocok untuk pecinta keju.",
    rating: 4.5,
    reviews: 87,
    stock: 40,
  },
};

// Cart Management
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Update cart count
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    cartCount.textContent = count;
  }
}

// Add to cart
function addToCart(productId, quantity = 1) {
  const product = products[productId];
  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showNotification(`${product.name} ditambahkan ke keranjang`, "success");
}

// Remove from cart
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// Update quantity
function updateQuantity(productId, newQuantity) {
  const item = cart.find((item) => item.id === productId);
  if (item && newQuantity > 0) {
    item.quantity = newQuantity;
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
  }
}

// Get cart total
function getCartTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// Notification system
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <i class="fas fa-${
          type === "success" ? "check-circle" : "info-circle"
        }"></i>
        ${message}
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  updateCartCount();

  // Add to cart buttons
  document.querySelectorAll(".btn-add-to-cart").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = parseInt(this.dataset.id);
      addToCart(productId);
    });
  });

  // Product detail buttons
  document.querySelectorAll(".btn-detail").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = parseInt(this.dataset.id);
      showProductDetail(productId);
    });
  });

  // Smooth scroll for navigation
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
});

// Show product detail modal
function showProductDetail(productId) {
  const product = products[productId];
  if (!product) return;

  const modalContent = `
        <div class="product-detail-modal">
            <div class="row">
                <div class="col-md-6">
                    <img src="${product.image}" class="img-fluid" alt="${
    product.name
  }">
                </div>
                <div class="col-md-6">
                    <h3>${product.name}</h3>
                    <div class="price">Rp ${product.price.toLocaleString()}</div>
                    <div class="rating mb-3">
                        ${getRatingStars(product.rating)}
                        <span>${product.rating} (${
    product.reviews
  } ulasan)</span>
                    </div>
                    <p>${product.description}</p>
                    <p><strong>Stok:</strong> ${product.stock} pack</p>
                    <button class="btn btn-success btn-block btn-add-to-cart-modal" data-id="${
                      product.id
                    }">
                        <i class="fas fa-cart-plus"></i> Tambah ke Keranjang
                    </button>
                </div>
            </div>
        </div>
    `;

  document.getElementById("modal-product-content").innerHTML = modalContent;
  $("#productModal").modal("show");

  // Add event listener for modal add to cart button
  document
    .querySelector(".btn-add-to-cart-modal")
    .addEventListener("click", function () {
      addToCart(productId);
      $("#productModal").modal("hide");
    });
}

// Helper function for rating stars
function getRatingStars(rating) {
  let stars = "";
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }
  if (halfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }
  for (let i = fullStars + (halfStar ? 1 : 0); i < 5; i++) {
    stars += '<i class="far fa-star"></i>';
  }

  return stars;
}

// Order history management
function saveOrder(orderData) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  orderData.id = "ORD" + Date.now().toString().slice(-6);
  orderData.date = new Date().toISOString();
  orderData.status = "diproses";
  orders.push(orderData);
  localStorage.setItem("orders", JSON.stringify(orders));

  // Clear cart after successful order
  localStorage.removeItem("cart");
  cart = [];
  updateCartCount();

  return orderData.id;
}

function getOrders() {
  return JSON.parse(localStorage.getItem("orders")) || [];
}
