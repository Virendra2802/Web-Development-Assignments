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
