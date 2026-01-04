// History Page JavaScript
document.addEventListener("DOMContentLoaded", function () {
  console.log("History page loaded");
  console.log("Orders in localStorage:", localStorage.getItem("orders"));

  loadOrders();
  updateStats();
  updateCartCount();
  updateHistoryCount();

  // Setup event listeners
  setupEventListeners();
});

function loadOrders(filter = "all") {
  console.log("Loading orders with filter:", filter);

  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  console.log("Found orders:", orders.length);

  // Apply filter if not 'all'
  let filteredOrders = orders;
  if (filter !== "all") {
    filteredOrders = orders.filter((order) => order.status === filter);
  }

  // Sort by newest first
  filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

  displayOrders(filteredOrders);

  // Show/hide empty state
  const emptyState = document.getElementById("empty-history");
  const ordersList = document.getElementById("orders-list");
  const loading = document.getElementById("loading-history");

  if (loading) loading.style.display = "none";

  if (filteredOrders.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    if (ordersList) ordersList.innerHTML = "";
  } else {
    if (emptyState) emptyState.style.display = "none";
  }
}

function displayOrders(orders) {
  const ordersList = document.getElementById("orders-list");
  if (!ordersList) return;

  let html = "";

  orders.forEach((order) => {
    const orderDate = formatDate(order.date);
    const statusText = getStatusText(order.status);
    const statusClass = getStatusClass(order.status);
    const totalItems = order.items
      ? order.items.reduce((sum, item) => sum + item.quantity, 0)
      : 0;

    html += `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <div>
                        <div class="order-id">Pesanan #${order.id}</div>
                        <div class="order-date">
                            <i class="far fa-calendar-alt"></i> ${orderDate}
                        </div>
                    </div>
                    <div class="order-status">
                        <span class="badge badge-${statusClass}">${statusText}</span>
                    </div>
                </div>
                
                <div class="order-products">
                    ${
                      order.items
                        ? order.items
                            .slice(0, 3)
                            .map(
                              (item) => `
                        <div class="product-item">
                            <div class="product-name">
                                <i class="fas fa-cookie-bite"></i> ${
                                  item.name || "Produk"
                                }
                            </div>
                            <div class="product-quantity">${
                              item.quantity
                            } × Rp ${formatPrice(item.price || 0)}</div>
                            <div class="product-price">Rp ${formatPrice(
                              (item.price || 0) * item.quantity
                            )}</div>
                        </div>
                    `
                            )
                            .join("")
                        : "<p>Tidak ada item</p>"
                    }
                    
                    ${
                      order.items && order.items.length > 3
                        ? `
                        <div class="product-item text-center text-muted">
                            <em>+ ${order.items.length - 3} produk lainnya</em>
                        </div>
                    `
                        : ""
                    }
                </div>
                
                <div class="order-footer">
                    <div class="order-total">
                        <i class="fas fa-receipt"></i> Total: Rp ${formatPrice(
                          order.total || 0
                        )}
                        <small class="text-muted ml-2">(${totalItems} item)</small>
                    </div>
                    <div class="order-actions">
                        <button class="btn btn-detail" onclick="showOrderDetail('${
                          order.id
                        }')">
                            <i class="fas fa-eye"></i> Lihat Detail
                        </button>
                        ${
                          order.payment?.status === "menunggu_pembayaran"
                            ? `<button class="btn btn-warning" onclick="completeCOD('${order.id}')">
                                <i class="fas fa-money-bill-wave"></i> Bayar COD
                               </button>`
                            : ""
                        }
                    </div>
                </div>
            </div>
        `;
  });

  ordersList.innerHTML = html;
}

function showOrderDetail(orderId) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    alert("Pesanan tidak ditemukan!");
    return;
  }

  // Populate modal
  document.getElementById("modal-order-id").textContent = order.id || "-";
  document.getElementById("modal-order-date").textContent =
    formatDate(order.date) || "-";
  document.getElementById("modal-customer-name").textContent =
    order.customer?.name || "-";
  document.getElementById("modal-customer-phone").textContent =
    order.customer?.phone || "-";
  document.getElementById("modal-customer-address").textContent =
    order.customer?.address || "-";
  document.getElementById("modal-payment-method").textContent =
    order.payment?.method || "-";

  // Order status
  const orderStatus = document.getElementById("modal-order-status");
  if (orderStatus) {
    orderStatus.textContent = getStatusText(order.status);
    orderStatus.className = `badge badge-${getStatusClass(order.status)}`;
  }

  // Payment status
  const paymentStatus = document.getElementById("modal-payment-status");
  if (paymentStatus) {
    if (order.payment?.status === "lunas") {
      paymentStatus.textContent = "Lunas";
      paymentStatus.className = "badge badge-success";
    } else if (order.payment?.status === "menunggu_pembayaran") {
      paymentStatus.textContent = "Belum Bayar";
      paymentStatus.className = "badge badge-warning";
    } else {
      paymentStatus.textContent = order.payment?.status || "-";
      paymentStatus.className = "badge badge-secondary";
    }
  }

  document.getElementById("modal-notes").textContent = order.notes || "-";
  document.getElementById("modal-subtotal").textContent = `Rp ${formatPrice(
    order.subtotal || 0
  )}`;
  document.getElementById("modal-shipping").textContent = `Rp ${formatPrice(
    order.shipping || 0
  )}`;
  document.getElementById("modal-total").textContent = `Rp ${formatPrice(
    order.total || 0
  )}`;

  // Update order items
  const itemsTable = document.getElementById("modal-order-items");
  if (itemsTable && order.items) {
    let itemsHtml = "";
    order.items.forEach((item) => {
      itemsHtml += `
                <tr>
                    <td>${item.name || "Produk"}</td>
                    <td class="text-center">Rp ${formatPrice(
                      item.price || 0
                    )}</td>
                    <td class="text-center">${item.quantity || 0}</td>
                    <td class="text-right">Rp ${formatPrice(
                      (item.price || 0) * (item.quantity || 0)
                    )}</td>
                </tr>
            `;
    });
    itemsTable.innerHTML = itemsHtml;
  }

  // Update tracking steps
  updateTrackingSteps(order);

  // Show modal
  $("#orderDetailModal").modal("show");
}

function updateTrackingSteps(order) {
  const steps = document.querySelectorAll(".tracking-step");
  const statusIndex = {
    diproses: 2, // After payment
    dikemas: 3,
    dikirim: 4,
    selesai: 5,
  };

  const currentStep =
    statusIndex[order.status] ||
    (order.payment?.status === "menunggu_pembayaran" ? 1 : 2);

  steps.forEach((step, index) => {
    step.classList.remove("active", "completed");
    if (index < currentStep) {
      step.classList.add("completed");
    } else if (index === currentStep) {
      step.classList.add("active");
    }
  });
}

function updateStats() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  const stats = {
    diproses: orders.filter((o) => o.status === "diproses").length,
    dikemas: orders.filter((o) => o.status === "dikemas").length,
    dikirim: orders.filter((o) => o.status === "dikirim").length,
    selesai: orders.filter((o) => o.status === "selesai").length,
  };

  // Update counter elements
  const diprosesEl = document.getElementById("count-diproses");
  const dikemasEl = document.getElementById("count-dikemas");
  const dikirimEl = document.getElementById("count-dikirim");
  const selesaiEl = document.getElementById("count-selesai");

  if (diprosesEl) diprosesEl.textContent = stats.diproses;
  if (dikemasEl) dikemasEl.textContent = stats.dikemas;
  if (dikirimEl) dikirimEl.textContent = stats.dikirim;
  if (selesaiEl) selesaiEl.textContent = stats.selesai;
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const cartCount = document.getElementById("cart-count-nav");
  if (cartCount) {
    cartCount.textContent = count;
  }
}

function updateHistoryCount() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const historyCount = document.getElementById("history-count");

  if (historyCount) {
    historyCount.textContent = orders.length;
  }
}

function setupEventListeners() {
  // Filter buttons
  document.querySelectorAll('input[name="filter"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      const filterValue = this.id.replace("filter-", "");
      loadOrders(filterValue === "all" ? "all" : filterValue);
    });
  });

  // Search input
  const searchInput = document.getElementById("search-orders");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase();
      filterOrdersBySearch(searchTerm);
    });
  }
}

function filterOrdersBySearch(searchTerm) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const filteredOrders = orders.filter((order) => {
    // Search in order ID
    if (order.id && order.id.toLowerCase().includes(searchTerm)) return true;

    // Search in product names
    if (
      order.items &&
      order.items.some(
        (item) => item.name && item.name.toLowerCase().includes(searchTerm)
      )
    )
      return true;

    // Search in customer name
    if (
      order.customer &&
      order.customer.name &&
      order.customer.name.toLowerCase().includes(searchTerm)
    )
      return true;

    return false;
  });

  displayOrders(filteredOrders);
}

function completeCOD(orderId) {
  if (
    confirm(
      "Konfirmasi pembayaran COD? Pesanan akan diproses setelah pembayaran."
    )
  ) {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const orderIndex = orders.findIndex((o) => o.id === orderId);

    if (orderIndex !== -1) {
      // Update payment status
      orders[orderIndex].payment.status = "lunas";

      // Update order status
      orders[orderIndex].status = "diproses";

      // Update tracking
      if (orders[orderIndex].tracking) {
        orders[orderIndex].tracking.steps[1].description =
          "Pembayaran COD berhasil";
        orders[orderIndex].tracking.currentStep = 2;
      }

      // Save back to localStorage
      localStorage.setItem("orders", JSON.stringify(orders));

      // Reload orders
      loadOrders();
      updateStats();
      updateHistoryCount();

      alert("Pembayaran COD berhasil dikonfirmasi!");
    }
  }
}

// Helper functions
function formatPrice(price) {
  if (!price) return "0";
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDate(dateString) {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return dateString;
  }
}

function getStatusText(status) {
  const statusMap = {
    diproses: "Diproses",
    dikemas: "Dikemas",
    dikirim: "Dikirim",
    selesai: "Selesai",
  };
  return statusMap[status] || status || "Unknown";
}

function getStatusClass(status) {
  const classMap = {
    diproses: "warning",
    dikemas: "info",
    dikirim: "primary",
    selesai: "success",
  };
  return classMap[status] || "secondary";
}

function printReceipt() {
  window.print();
}
