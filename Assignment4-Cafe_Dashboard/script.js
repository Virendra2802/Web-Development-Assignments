let cart=[]
let total=0

let currentProduct={}

function scrollMenu(){
document.getElementById("menu-section").scrollIntoView()
}

function scrollHome(){
window.scrollTo(0,0)
}
/*MENU*/
function scrollAbout(){
document.getElementById("about-section").scrollIntoView({
behavior:"smooth"
});
}
/* PRODUCT MODAL */

function openProduct(name,price,img){

currentProduct={name,price}

document.getElementById("modal-name").innerText=name
document.getElementById("modal-price").innerText=price
document.getElementById("modal-img").src=img

document.getElementById("product-modal").style.display="block"

}

function closeModal(){

document.getElementById("product-modal").style.display="none"

}

/* CART */

function addToCart(){

cart.push(currentProduct)

total+=currentProduct.price

updateCart()

closeModal()

}


function updateCart(){

let list=document.getElementById("cart-items")

list.innerHTML=""

cart.forEach(item=>{

let li=document.createElement("li")

li.innerText=item.name+" ₹"+item.price

list.appendChild(li)

})

document.getElementById("cart-count").innerText=cart.length

document.getElementById("total").innerText=total

}

function toggleCart(){

let cartPanel=document.getElementById("cart-panel")

cartPanel.style.display=cartPanel.style.display=="block"?"none":"block"

}

/* CHECKOUT */

function checkout(){

if(cart.length==0){

alert("Cart empty")

return

}

document.getElementById("payment").style.display="block"

}

function placeOrder(){

let method=document.getElementById("payment-method").value

alert("Order placed successfully using "+method)

cart=[]

total=0

updateCart()

document.getElementById("payment").style.display="none"

}
function closePayment(){

document.getElementById("payment").style.display="none"

}

/* gift card */
function scrollGift(){
document.getElementById("gift-section").scrollIntoView({
behavior:"smooth"
});
}

/* DASHBOARD */
function scrollDashboard(){
document.getElementById("dashboard-section").scrollIntoView({
behavior:"smooth"
});
}

// Initialize Charts when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  
  // Sales Chart (Bar)
  const salesCtx = document.getElementById('salesChart').getContext('2d');
  new Chart(salesCtx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Weekly Sales (₹)',
        data: [15000, 18000, 14000, 22000, 29000, 45000, 38000],
        backgroundColor: 'rgba(30, 57, 50, 0.7)', // Matching the theme dark green
        borderColor: 'rgba(30, 57, 50, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Popular Items Chart (Doughnut)
  const itemsCtx = document.getElementById('popularItemsChart').getContext('2d');
  new Chart(itemsCtx, {
    type: 'doughnut',
    data: {
      labels: ['Cappuccino', 'Cold Coffee', 'Burger & Fries', 'Sandwich', 'Chocolate Cake'],
      datasets: [{
        label: 'Items Sold',
        data: [350, 200, 150, 100, 80],
        backgroundColor: [
          '#6d4c41', // Brown
          '#d7ccc8', // Light Brown
          '#fbc02d', // Yellow/Gold
          '#ffb74d', // Orange
          '#3e2723'  // Dark Chocolate
        ],
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        }
      }
    }
  });
  
});
