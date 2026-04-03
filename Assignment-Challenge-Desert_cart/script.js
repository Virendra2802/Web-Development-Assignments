let cart = [];
let total = 0;

const buttons = document.querySelectorAll(".btn");
const cartItems = document.getElementById("cart-items");
const totalDisplay = document.getElementById("total");
const countDisplay = document.getElementById("count");
const confirmButton = document.querySelector(".checkout");
const resetButton = document.querySelector(".reset");
const orderModal = document.getElementById("order-modal");
const closeModal = document.getElementById("close-modal");
const modalMessage = document.getElementById("modal-message");
const modalOrderList = document.getElementById("modal-order-list");
const modalOrderTotal = document.getElementById("modal-order-total");

buttons.forEach(button => {
  button.addEventListener("click", () => {
    const card = button.parentElement;
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);

    addToCart(name, price);
  });
});

confirmButton.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Please add at least one product to your cart before confirming order.");
    return;
  }

  modalMessage.textContent = "We hope you enjoy your food";

  const orderSummary = [...cart];
  const orderTotalAmount = total;

  modalOrderList.innerHTML = "";
  orderSummary.forEach(item => {
    const itemRow = document.createElement("div");
    itemRow.innerHTML = `<span>${item.name}</span><span>$${item.price.toFixed(2)}</span>`;
    modalOrderList.appendChild(itemRow);
  });

  modalOrderTotal.textContent = `Order total: $${orderTotalAmount.toFixed(2)}`;

  orderModal.classList.remove("hidden");

  resetCart();
});

resetButton.addEventListener("click", () => {
  resetCart();
});

closeModal.addEventListener("click", () => {
  orderModal.classList.add("hidden");
});

function addToCart(name, price) {
  cart.push({ name, price });
  total += price;

  updateCart();
}

function resetCart() {
  cart = [];
  total = 0;
  updateCart();
}

function updateCart() {
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = "<p class='empty'>Your added items will appear here</p>";
  } else {
    cart.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("cart-item");

      div.innerHTML = `
        <span>${item.name}</span>
        <span>$${item.price.toFixed(2)}</span>
      `;

      cartItems.appendChild(div);
    });
  }

  totalDisplay.textContent = total.toFixed(2);
  countDisplay.textContent = cart.length;
}
