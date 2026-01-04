// Checkout Page
document.addEventListener("DOMContentLoaded", function () {
  // Load checkout data
  const checkoutData = JSON.parse(localStorage.getItem("checkoutData"));
  if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
    alert("Keranjang kosong! Silakan tambahkan produk terlebih dahulu.");
    window.location.href = "index.html";
    return;
  }

  // Update order items display
  updateOrderItems(checkoutData);

  // Update totals
  document.getElementById(
    "review-subtotal"
  ).textContent = `Rp ${checkoutData.subtotal.toLocaleString()}`;
  document.getElementById(
    "review-shipping"
  ).textContent = `Rp ${checkoutData.shipping.toLocaleString()}`;
  document.getElementById(
    "review-total"
  ).textContent = `Rp ${checkoutData.total.toLocaleString()}`;

  // Place order button
  document
    .getElementById("place-order-btn")
    .addEventListener("click", placeOrder);

  // Form validation
  const form = document.getElementById("checkout-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
  });
});

function updateOrderItems(checkoutData) {
  const itemsContainer = document.getElementById("order-items");
  let html = "";

  checkoutData.items.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    html += `
            <div class="order-item">
                <div class="order-item-name">
                    ${item.name}
                </div>
                <div class="order-item-qty">
                    ${item.quantity} x Rp ${item.price.toLocaleString()}
                </div>
                <div class="order-item-price">
                    Rp ${itemTotal.toLocaleString()}
                </div>
            </div>
        `;
  });

  itemsContainer.innerHTML = html;
}

function placeOrder() {
  // Validate form
  const nama = document.getElementById("nama").value.trim();
  const telepon = document.getElementById("telepon").value.trim();
  const alamat = document.getElementById("alamat").value.trim();
  const kota = document.getElementById("kota").value.trim();

  if (!nama || !telepon || !alamat || !kota) {
    alert("Harap lengkapi semua data yang wajib diisi!");
    return;
  }

  const checkoutData = JSON.parse(localStorage.getItem("checkoutData"));
  const paymentMethod = document.querySelector(
    'input[name="payment"]:checked'
  ).value;
  const catatan = document.getElementById("catatan").value.trim();

  // Prepare order data
  const orderData = {
    customer: {
      nama: nama,
      telepon: telepon,
      alamat: alamat,
      kota: kota,
      kodepos: document.getElementById("kodepos").value.trim(),
    },
    items: checkoutData.items,
    subtotal: checkoutData.subtotal,
    shipping: checkoutData.shipping,
    total: checkoutData.total,
    payment: paymentMethod,
    catatan: catatan,
    status: "diproses",
    date: new Date().toLocaleString("id-ID"),
  };

  // Save order to history
  saveOrderToHistory(orderData);

  // Show success modal
  $("#successModal").modal("show");

  // Update modal details
  document.getElementById(
    "order-total-modal"
  ).textContent = `Rp ${checkoutData.total.toLocaleString()}`;

  // Clear checkout data
  localStorage.removeItem("checkoutData");
}

function saveOrderToHistory(orderData) {
  // Get existing orders or create new array
  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  // Generate order ID
  const orderId = "ORD" + Date.now().toString().slice(-6);

  // Add order to history
  orders.unshift({
    id: orderId,
    ...orderData,
    timestamp: new Date().toISOString(),
  });

  // Save back to localStorage
  localStorage.setItem("orders", JSON.stringify(orders));

  // Update success modal with order ID
  document.getElementById("order-number").textContent = orderId;
}
// Add these functions to your existing checkout.js

// After successful checkout, save order to history
function completeCheckout(orderData) {
  // Save order to localStorage
  const orderId = saveOrderToLocalStorage(orderData);

  // Clear cart
  localStorage.removeItem("cart");
  localStorage.removeItem("checkoutData");

  // Show success modal
  showSuccessModal(orderId, orderData.total);

  // Update cart count in all pages
  updateCartCountGlobally();
}

function saveOrderToLocalStorage(orderData) {
  const orderId = "ORD" + Date.now().toString().slice(-6);

  const completeOrder = {
    id: orderId,
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: "diproses",
    items: orderData.items || [],
    subtotal: orderData.subtotal || 0,
    shipping: orderData.shipping || 0,
    total: orderData.total || 0,
    customer: orderData.customer || {},
    payment: orderData.payment || {},
    notes: orderData.catatan || "",
  };

  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  orders.unshift(completeOrder);
  localStorage.setItem("orders", JSON.stringify(orders));

  return orderId;
}

function showSuccessModal(orderId, total) {
  // Update modal content
  document.getElementById("order-number").textContent = orderId;
  document.getElementById(
    "order-total-modal"
  ).textContent = `Rp ${total.toLocaleString()}`;

  // Show modal
  $("#successModal").modal("show");
}

function updateCartCountGlobally() {
  const cartCount = document.getElementById("cart-count");
  if (cartCount) cartCount.textContent = "0";

  const cartCountNav = document.getElementById("cart-count-nav");
  if (cartCountNav) cartCountNav.textContent = "0";
}

// Update your existing placeOrder function in checkout.js
// Replace the existing placeOrder function with:

function placeOrder() {
  // Validate form
  const nama = document.getElementById("nama").value.trim();
  const telepon = document.getElementById("telepon").value.trim();
  const alamat = document.getElementById("alamat").value.trim();
  const kota = document.getElementById("kota").value.trim();

  if (!nama || !telepon || !alamat || !kota) {
    showAlert("Harap lengkapi semua data yang wajib diisi!", "warning");
    return;
  }

  const checkoutData = JSON.parse(localStorage.getItem("checkoutData"));
  if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
    showAlert("Keranjang kosong!", "warning");
    return;
  }

  const paymentMethod = document.querySelector(
    'input[name="payment"]:checked'
  ).value;
  const catatan = document.getElementById("catatan").value.trim();

  // Prepare order data
  const orderData = {
    customer: {
      name: nama,
      phone: telepon,
      address: alamat,
      city: kota,
      postalCode: document.getElementById("kodepos").value.trim(),
    },
    items: checkoutData.items,
    subtotal: checkoutData.subtotal,
    shipping: checkoutData.shipping,
    total: checkoutData.total,
    payment: {
      method:
        paymentMethod === "bank"
          ? "Transfer Bank"
          : paymentMethod === "ewallet"
          ? "E-Wallet"
          : "COD",
      status: paymentMethod === "cod" ? "belum_bayar" : "lunas",
    },
    catatan: catatan,
  };

  // Complete checkout
  completeCheckout(orderData);
}

function showAlert(message, type = "info") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alertDiv.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
    `;
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert">
            <span>&times;</span>
        </button>
    `;

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    $(alertDiv).alert("close");
  }, 3000);
}
// Add this function to your checkout.js to save order with tracking data
function saveOrderWithTracking(orderData) {
  const orderId = "ORD" + Date.now().toString().slice(-6);

  // Generate tracking steps
  const trackingSteps = [
    {
      title: "Pesanan Diterima",
      description: "Pesanan Anda telah diterima sistem",
    },
    { title: "Sedang Diproses", description: "Kue sagon sedang dibuat" },
    {
      title: "Sedang Dikemas",
      description: "Pesanan sedang dikemas dengan rapi",
    },
    { title: "Siap Dikirim", description: "Pesanan siap dikirim ke kurir" },
  ];

  // Add current time to first step
  trackingSteps[0].time = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Generate estimated delivery time (2 hours from now)
  const estimatedDelivery = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const deliveryEstimation = `Hari ini, ${estimatedDelivery.toLocaleTimeString(
    "id-ID",
    { hour: "2-digit", minute: "2-digit" }
  )}`;

  const completeOrder = {
    id: orderId,
    timestamp: new Date().toISOString(),
    status: "diproses",
    ...orderData,
    tracking: {
      steps: trackingSteps,
      currentStep: 0,
    },
    deliveryEstimation: deliveryEstimation,
    estimatedDelivery: `Hari ini, ${estimatedDelivery.toLocaleTimeString(
      "id-ID",
      { hour: "2-digit", minute: "2-digit" }
    )}`,
  };

  // Save to localStorage
  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  orders.unshift(completeOrder);
  localStorage.setItem("orders", JSON.stringify(orders));

  return orderId;
}

// Update your completeCheckout function
function completeCheckout(orderData) {
  // Save order with tracking data
  const orderId = saveOrderWithTracking(orderData);

  // Clear cart
  localStorage.removeItem("cart");
  localStorage.removeItem("checkoutData");

  // Show success modal with tracking info
  showSuccessModal(orderId, orderData.total);

  // Update cart count
  updateCartCountGlobally();

  // Redirect to history after 3 seconds
  setTimeout(() => {
    window.location.href = "history.html";
  }, 3000);
}
// Di file checkout.js, GANTI function placeOrder() dengan ini:

function placeOrder() {
  // Validate form
  const nama = document.getElementById("nama").value.trim();
  const telepon = document.getElementById("telepon").value.trim();
  const alamat = document.getElementById("alamat").value.trim();
  const kota = document.getElementById("kota").value.trim();

  if (!nama || !telepon || !alamat || !kota) {
    alert("Harap lengkapi semua data yang wajib diisi!");
    return;
  }

  const checkoutData = JSON.parse(localStorage.getItem("checkoutData"));
  if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
    alert("Keranjang kosong! Silakan tambahkan produk terlebih dahulu.");
    window.location.href = "cart.html";
    return;
  }

  const paymentMethod = document.querySelector(
    'input[name="payment"]:checked'
  ).value;
  const catatan = document.getElementById("catatan").value.trim();

  // Prepare order data
  const orderData = {
    id: generateOrderId(),
    date: new Date().toISOString(),
    status: "diproses",
    items: checkoutData.items,
    subtotal: checkoutData.subtotal,
    shipping: checkoutData.shipping,
    total: checkoutData.total,
    customer: {
      name: nama,
      phone: telepon,
      address: alamat,
      city: kota,
      postalCode: document.getElementById("kodepos").value.trim(),
    },
    payment: {
      method: getPaymentMethodText(paymentMethod),
      status: paymentMethod === "cod" ? "belum_bayar" : "lunas",
    },
    notes: catatan,
    tracking: {
      steps: [
        {
          title: "Pesanan Diterima",
          description: "Pesanan Anda telah diterima sistem",
          time: getCurrentTime(),
        },
        { title: "Sedang Diproses", description: "Kue sagon sedang dibuat" },
        { title: "Dikemas", description: "Pesanan sedang dikemas dengan rapi" },
        { title: "Dikirim", description: "Pesanan dalam pengiriman" },
        { title: "Selesai", description: "Pesanan telah sampai" },
      ],
      currentStep: 0,
    },
  };

  // Save order to history
  saveOrderToHistory(orderData);

  // Clear cart and checkout data
  localStorage.removeItem("cart");
  localStorage.removeItem("checkoutData");

  // Show success modal
  showSuccessModal(orderData.id, orderData.total);

  // Update cart count
  updateCartCount();

  // Redirect to history after 5 seconds
  setTimeout(() => {
    window.location.href = "history.html";
  }, 5000);
}

// Helper functions untuk checkout.js
function generateOrderId() {
  return "ORD" + Date.now().toString().slice(-8);
}

function getPaymentMethodText(method) {
  const methods = {
    bank: "Transfer Bank",
    "e-wallet": "E-Wallet",
    cash: "COD (Bayar di Tempat)",
  };
  return methods[method] || method;
}

function getCurrentTime() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function saveOrderToHistory(orderData) {
  // Get existing orders or create new array
  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  // Add new order to the beginning
  orders.unshift(orderData);

  // Save back to localStorage
  localStorage.setItem("orders", JSON.stringify(orders));

  console.log("Order saved to history:", orderData);
}

function showSuccessModal(orderId, total) {
  // Update modal content
  document.getElementById("order-number").textContent = orderId;
  document.getElementById(
    "order-total-modal"
  ).textContent = `Rp ${total.toLocaleString()}`;

  // Show modal
  $("#successModal").modal("show");
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Update cart count in all pages
  const cartCountElements = document.querySelectorAll(
    "#cart-count, #cart-count-nav"
  );
  cartCountElements.forEach((el) => {
    if (el) el.textContent = count;
  });
}
// Di file checkout.js, UPDATE function placeOrder():

function placeOrder() {
  // Validate form
  const nama = document.getElementById("nama").value.trim();
  const telepon = document.getElementById("telepon").value.trim();
  const alamat = document.getElementById("alamat").value.trim();
  const kota = document.getElementById("kota").value.trim();

  if (!nama || !telepon || !alamat || !kota) {
    showAlert("Harap lengkapi semua data yang wajib diisi!", "warning");
    return;
  }

  const checkoutData = JSON.parse(localStorage.getItem("checkoutData"));
  if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
    showAlert(
      "Keranjang kosong! Silakan tambahkan produk terlebih dahulu.",
      "warning"
    );
    window.location.href = "cart.html";
    return;
  }

  const paymentMethod = document.querySelector(
    'input[name="payment"]:checked'
  ).value;
  const catatan = document.getElementById("catatan").value.trim();

  // Save order data for payment page
  const orderData = {
    customer: {
      name: nama,
      phone: telepon,
      address: alamat,
      city: kota,
      postalCode: document.getElementById("kodepos").value.trim(),
    },
    payment: {
      method:
        paymentMethod === "bank"
          ? "Transfer Bank"
          : paymentMethod === "ewallet"
          ? "E-Wallet"
          : "COD",
    },
    notes: catatan,
  };

  localStorage.setItem("orderData", JSON.stringify(orderData));

  // Mark as pending payment
  localStorage.setItem("pendingPayment", "true");

  // Redirect to payment page
  window.location.href = "payment.html";
}

// Di file cart.js, UPDATE checkout process:

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
