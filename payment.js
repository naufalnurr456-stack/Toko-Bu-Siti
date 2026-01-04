// Payment System JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Initialize payment page
  initializePayment();

  // Setup event listeners
  setupEventListeners();

  // Start payment timer
  startPaymentTimer();
});

function initializePayment() {
  console.log("Initializing payment page...");

  // Check if there's pending payment
  const pendingPayment = localStorage.getItem("pendingPayment");
  const checkoutData = JSON.parse(localStorage.getItem("checkoutData"));

  if (!pendingPayment && !checkoutData) {
    // Redirect to cart if no pending payment
    alert(
      "Tidak ada pesanan yang perlu dibayar. Silakan buat pesanan terlebih dahulu."
    );
    window.location.href = "cart.html";
    return;
  }

  // Load order data
  loadOrderData();
}

function loadOrderData() {
  const checkoutData = JSON.parse(localStorage.getItem("checkoutData"));
  const orderData = JSON.parse(localStorage.getItem("orderData")) || {};

  if (!checkoutData && !orderData) {
    console.error("No order data found");
    return;
  }

  const data = checkoutData || orderData;

  // Update order summary
  updateOrderSummary(data);

  // Update order details
  updateOrderDetails(data);

  // Update customer info
  updateCustomerInfo(data);

  // Update total payment
  updateTotalPayment(data.total);
}

function updateOrderSummary(data) {
  const summaryElement = document.getElementById("order-summary");
  if (!summaryElement) return;

  const subtotal = data.subtotal || 0;
  const shipping = data.shipping || 0;
  const total = data.total || 0;

  summaryElement.innerHTML = `
        <div class="order-summary-item">
            <span>Subtotal</span>
            <span class="font-weight-bold">Rp ${formatPrice(subtotal)}</span>
        </div>
        <div class="order-summary-item">
            <span>Ongkos Kirim</span>
            <span class="font-weight-bold">Rp ${formatPrice(shipping)}</span>
        </div>
        <div class="order-summary-item">
            <span>Diskon</span>
            <span class="font-weight-bold">Rp 0</span>
        </div>
        <div class="order-summary-item">
            <span>Biaya Admin</span>
            <span class="font-weight-bold">Rp 0</span>
        </div>
    `;
}

function updateOrderDetails(data) {
  const detailsElement = document.getElementById("order-details");
  if (!detailsElement) return;

  const items = data.items || [];
  let itemsHtml = "";

  items.forEach((item) => {
    itemsHtml += `
            <div class="order-item">
                <div class="item-name">
                    <strong>${item.name}</strong>
                    <div class="small text-muted">${
                      item.quantity
                    } × Rp ${formatPrice(item.price)}</div>
                </div>
                <div class="item-price">
                    Rp ${formatPrice(item.price * item.quantity)}
                </div>
            </div>
        `;
  });

  detailsElement.innerHTML = itemsHtml;
}

function updateCustomerInfo(data) {
  const customerInfoElement = document.getElementById("customer-info");
  if (!customerInfoElement) return;

  const customer = data.customer || {};

  customerInfoElement.innerHTML = `
        <div class="customer-info-item">
            <strong>Nama</strong>
            <span>${customer.name || "-"}</span>
        </div>
        <div class="customer-info-item">
            <strong>Telepon</strong>
            <span>${customer.phone || "-"}</span>
        </div>
        <div class="customer-info-item">
            <strong>Alamat</strong>
            <span class="small">${customer.address || "-"}</span>
        </div>
        <div class="customer-info-item">
            <strong>Metode Pengiriman</strong>
            <span>Standard Delivery (1-2 hari)</span>
        </div>
    `;
}

function updateTotalPayment(total) {
  const totalElement = document.getElementById("total-payment");
  if (totalElement) {
    totalElement.textContent = `Rp ${formatPrice(total)}`;
  }
}

function setupEventListeners() {
  // Payment method selection
  document.querySelectorAll('input[name="payment-method"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      const method = this.value;
      showPaymentMethod(method);
    });
  });

  // Upload proof of payment
  const uploadArea = document.getElementById("upload-area");
  const fileInput = document.getElementById("payment-proof");

  if (uploadArea && fileInput) {
    uploadArea.addEventListener("click", () => fileInput.click());
    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = "var(--primary-brown)";
      uploadArea.style.background = "rgba(139, 69, 19, 0.05)";
    });
    uploadArea.addEventListener("dragleave", () => {
      uploadArea.style.borderColor = "#ddd";
      uploadArea.style.background = "#f8f9fa";
    });
    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = "#ddd";
      uploadArea.style.background = "#f8f9fa";

      if (e.dataTransfer.files.length) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length) {
        handleFileUpload(e.target.files[0]);
      }
    });
  }

  // Terms agreement
  const termsCheckbox = document.getElementById("agree-terms");
  const confirmButton = document.getElementById("confirm-payment");

  if (termsCheckbox && confirmButton) {
    termsCheckbox.addEventListener("change", function () {
      confirmButton.disabled = !this.checked;
    });
  }

  // Confirm payment button
  if (confirmButton) {
    confirmButton.addEventListener("click", processPayment);
  }

  // E-wallet buttons
  document.querySelectorAll(".ewallet-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const wallet = this.querySelector("span").textContent;
      processEWalletPayment(wallet);
    });
  });
}

function showPaymentMethod(method) {
  // Hide all method contents
  document.querySelectorAll(".method-content").forEach((content) => {
    content.style.display = "none";
  });

  // Show selected method content
  const contentId = method + "-content";
  const selectedContent = document.getElementById(contentId);
  if (selectedContent) {
    selectedContent.style.display = "block";
  }

  // Update payment method in localStorage
  updatePaymentMethod(method);
}

function updatePaymentMethod(method) {
  const checkoutData = JSON.parse(localStorage.getItem("checkoutData")) || {};
  const orderData = JSON.parse(localStorage.getItem("orderData")) || {};

  const methodText = getPaymentMethodText(method);

  // Update both data sources
  if (checkoutData) {
    checkoutData.paymentMethod = method;
    checkoutData.paymentMethodText = methodText;
    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
  }

  if (orderData) {
    if (!orderData.payment) orderData.payment = {};
    orderData.payment.method = methodText;
    localStorage.setItem("orderData", JSON.stringify(orderData));
  }
}

function handleFileUpload(file) {
  // Validate file
  if (!validateFile(file)) {
    return;
  }

  // Show file preview
  showFilePreview(file);

  // Save file info to localStorage
  savePaymentProof(file);
}

function validateFile(file) {
  const validTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    alert(
      "Format file tidak didukung. Silakan upload file JPG, PNG, atau PDF."
    );
    return false;
  }

  if (file.size > maxSize) {
    alert("Ukuran file terlalu besar. Maksimal 5MB.");
    return false;
  }

  return true;
}

function showFilePreview(file) {
  const previewArea = document.getElementById("file-preview");
  const fileName = document.getElementById("file-name");
  const fileSize = document.getElementById("file-size");

  if (!previewArea || !fileName || !fileSize) return;

  // Format file size
  const size =
    file.size > 1024 * 1024
      ? (file.size / (1024 * 1024)).toFixed(2) + " MB"
      : (file.size / 1024).toFixed(2) + " KB";

  fileName.textContent = file.name;
  fileSize.textContent = size;
  previewArea.style.display = "block";
}

function removeFile() {
  const previewArea = document.getElementById("file-preview");
  const fileInput = document.getElementById("payment-proof");

  if (previewArea) previewArea.style.display = "none";
  if (fileInput) fileInput.value = "";

  // Remove from localStorage
  localStorage.removeItem("paymentProof");
}

function savePaymentProof(file) {
  // In a real application, you would upload the file to a server
  // For demo purposes, we'll save file info to localStorage
  const reader = new FileReader();

  reader.onload = function (e) {
    const paymentProof = {
      name: file.name,
      type: file.type,
      size: file.size,
      data: e.target.result,
      uploadedAt: new Date().toISOString(),
    };

    localStorage.setItem("paymentProof", JSON.stringify(paymentProof));
    console.log("Payment proof saved");
  };

  reader.readAsDataURL(file);
}

function startPaymentTimer() {
  // Set expiration time (24 hours from now)
  const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;
  localStorage.setItem("paymentExpiresAt", expirationTime);

  // Update timer every second
  const timerInterval = setInterval(updateTimer, 1000);

  function updateTimer() {
    const now = new Date().getTime();
    const expiresAt =
      parseInt(localStorage.getItem("paymentExpiresAt")) || expirationTime;
    const timeLeft = expiresAt - now;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handlePaymentTimeout();
      return;
    }

    // Calculate hours, minutes, seconds
    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // Update timer display
    const hoursEl = document.getElementById("timer-hours");
    const minutesEl = document.getElementById("timer-minutes");
    const secondsEl = document.getElementById("timer-seconds");

    if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, "0");
    if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, "0");
    if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, "0");
  }

  // Initial update
  updateTimer();
}

function handlePaymentTimeout() {
  // Clear payment data
  localStorage.removeItem("pendingPayment");
  localStorage.removeItem("checkoutData");
  localStorage.removeItem("orderData");

  // Show timeout message
  alert("Waktu pembayaran telah habis. Pesanan Anda telah dibatalkan.");

  // Redirect to cart
  window.location.href = "cart.html";
}

function processPayment() {
  const paymentMethod = document.querySelector(
    'input[name="payment-method"]:checked'
  )?.value;
  const termsAgreed = document.getElementById("agree-terms")?.checked;

  if (!termsAgreed) {
    alert("Silakan setujui syarat & ketentuan terlebih dahulu.");
    return;
  }

  if (!paymentMethod) {
    alert("Silakan pilih metode pembayaran.");
    return;
  }

  // Validate payment based on method
  switch (paymentMethod) {
    case "bank":
      if (!validateBankTransfer()) return;
      break;
    case "ewallet":
      if (!validateEWallet()) return;
      break;
    case "cod":
      if (!validateCOD()) return;
      break;
  }

  // Process the payment
  completePayment(paymentMethod);
}

function validateBankTransfer() {
  const paymentProof = localStorage.getItem("paymentProof");

  if (!paymentProof) {
    alert("Silakan unggah bukti transfer terlebih dahulu.");
    return false;
  }

  return true;
}

function validateEWallet() {
  // In real app, integrate with e-wallet API
  // For demo, just return true
  return true;
}

function validateCOD() {
  const orderData = JSON.parse(localStorage.getItem("orderData")) || {};
  const address = orderData.customer?.address || "";

  // Check if COD is available for the address
  if (
    !address.toLowerCase().includes("ambal") &&
    !address.toLowerCase().includes("kutowinangun")
  ) {
    alert("COD hanya tersedia untuk area Ambal & Kutowinangun.");
    return false;
  }

  return true;
}

function completePayment(method) {
  // Show loading state
  const confirmButton = document.getElementById("confirm-payment");
  const originalText = confirmButton.innerHTML;
  confirmButton.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Memproses...';
  confirmButton.disabled = true;

  // Simulate payment processing
  setTimeout(() => {
    // Generate order ID
    const orderId = generateOrderId();

    // Get order data
    const checkoutData = JSON.parse(localStorage.getItem("checkoutData")) || {};
    const orderData = JSON.parse(localStorage.getItem("orderData")) || {};
    const customerData = orderData.customer || {};

    // Determine order status based on payment method
    let orderStatus = "diproses"; // Default status
    let paymentStatus = "lunas"; // Default payment status

    if (method === "cod") {
      orderStatus = "diproses";
      paymentStatus = "menunggu_pembayaran";
    } else if (method === "bank") {
      orderStatus = "diproses";
      paymentStatus = "lunas";
    } else if (method === "ewallet") {
      orderStatus = "diproses";
      paymentStatus = "lunas";
    }

    // Create complete order
    const completeOrder = {
      id: orderId,
      date: new Date().toISOString(),
      status: orderStatus,
      items: checkoutData.items || [],
      subtotal: checkoutData.subtotal || 0,
      shipping: checkoutData.shipping || 0,
      total: checkoutData.total || 0,
      customer: customerData,
      payment: {
        method: getPaymentMethodText(method),
        status: paymentStatus,
        proof: localStorage.getItem("paymentProof")
          ? JSON.parse(localStorage.getItem("paymentProof"))
          : null,
      },
      notes: document.getElementById("payment-notes")?.value || "",
      tracking: {
        steps: [
          {
            title: "Pesanan Diterima",
            description: "Pesanan Anda telah diterima",
            time: getCurrentTime(),
          },
          {
            title: "Pembayaran",
            description: getPaymentDescription(method, paymentStatus),
            time: getCurrentTime(),
          },
          { title: "Diproses", description: "Kue sagon sedang dibuat" },
          { title: "Dikemas", description: "Pesanan sedang dikemas" },
          { title: "Dikirim", description: "Pesanan dalam pengiriman" },
          { title: "Selesai", description: "Pesanan telah sampai" },
        ],
        currentStep: method === "cod" ? 1 : 2,
      },
    };

    // Save to orders history
    saveOrderToHistory(completeOrder);

    // Clear temporary data
    clearPaymentData();

    // Show success modal
    showSuccessModal(orderId, completeOrder.total);

    // Reset button
    confirmButton.innerHTML = originalText;
  }, 2000);
}

function getPaymentDescription(method, paymentStatus) {
  if (method === "cod") {
    return "Menunggu pembayaran COD";
  } else if (paymentStatus === "lunas") {
    return "Pembayaran berhasil";
  } else {
    return "Pembayaran sedang diproses";
  }
}

function processEWalletPayment(wallet) {
  const confirmButton = document.getElementById("confirm-payment");
  const originalText = confirmButton.innerHTML;

  confirmButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Redirect ke ${wallet}...`;
  confirmButton.disabled = true;

  // Simulate e-wallet redirect
  setTimeout(() => {
    // In real app, this would redirect to e-wallet payment page
    // For demo, we'll simulate successful payment
    alert(
      `Redirect ke ${wallet}. Silakan selesaikan pembayaran di aplikasi ${wallet}.`
    );

    // After "payment", complete the order
    completePayment("ewallet");
  }, 1000);
}

function saveOrderToHistory(order) {
  // Get existing orders
  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  // Add new order to beginning
  orders.unshift(order);

  // Save back to localStorage
  localStorage.setItem("orders", JSON.stringify(orders));

  console.log("Order saved to history:", order.id);
  console.log("Total orders now:", orders.length);
}

function clearPaymentData() {
  // Clear temporary payment data
  localStorage.removeItem("pendingPayment");
  localStorage.removeItem("checkoutData");
  localStorage.removeItem("orderData");
  localStorage.removeItem("paymentProof");
  localStorage.removeItem("paymentExpiresAt");
  localStorage.removeItem("cart"); // Clear cart as well

  // Update cart count
  updateCartCount();
}

function showSuccessModal(orderId, total) {
  // Update modal content
  document.getElementById("success-order-id").textContent = orderId;
  document.getElementById("success-total").textContent = `Rp ${formatPrice(
    total
  )}`;

  // Show modal
  $("#successModal").modal("show");

  // Set timeout to redirect to history page
  setTimeout(() => {
    window.location.href = "history.html";
  }, 5000); // Redirect after 5 seconds
}

function goToHistory() {
  window.location.href = "history.html";
}

function printReceipt() {
  // In a real app, generate printable receipt
  // For demo, just print the page
  window.print();
}

// Helper functions
function generateOrderId() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD${timestamp.slice(-6)}${random}`;
}

function getPaymentMethodText(method) {
  const methods = {
    bank: "Transfer Bank",
    ewallet: "E-Wallet / QRIS",
    cod: "COD (Bayar di Tempat)",
  };
  return methods[method] || method;
}

function getCurrentTime() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(price) {
  return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "0";
}

// Update cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const cartCountElements = document.querySelectorAll(
    "#cart-count, #cart-count-nav"
  );
  cartCountElements.forEach((el) => {
    if (el) el.textContent = count;
  });
}

// Initialize cart count
updateCartCount();
