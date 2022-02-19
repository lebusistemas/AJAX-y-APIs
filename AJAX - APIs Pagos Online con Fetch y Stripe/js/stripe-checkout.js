import STRIPE_KEYS from "./stripe-keys.js";

const d = document,
      $products = d.getElementById("products"),
      $template = d.getElementById("products-template").content,
      $fragment = d.createDocumentFragment(),
      fetchOptions = {
        headers: {
            Authorization: `Bearer ${STRIPE_KEYS.secret}`,
        }
      };

let products,prices;
const moneyFormat = num => `$${num.slice(0,-2)},${num.slice(-2)}`;

Promise.all([
    fetch("https://api.stripe.com/v1/products", fetchOptions),
    fetch("https://api.stripe.com/v1/prices", fetchOptions)
])
.then(Responses => Promise.all(Responses.map(res => res.json())))
.then(json => {
    //console.log(json)
    products = json[0].data;
    prices = json[1].data;
    //console.log(products,prices);

    prices.forEach(el => {
        let productData = products.filter(product => product.id === el.product);
        //console.log(productData);

        $template.querySelector(".product").setAttribute("data-price", el.id);
        $template.querySelector("img").src = productData[0].images[0];
        $template.querySelector("img").alt = productData[0].name;
        $template.querySelector("figcaption").innerHTML = `
            ${productData[0].name}
            <br>
            ${moneyFormat(el.unit_amount_decimal)} ${el.currency}
        `;

        let $clone = d.importNode($template, true);
        $fragment.appendChild($clone);
    });

    $products.appendChild($fragment);
})
.catch((err)=>{
    let message = res.statusText || "Ocurrio un error al conectarse con la API de Stripe"
    $products.innerHTML = `<p>Error ${err.status}: ${message}</p>`
    console.log(message);
});

d.addEventListener("click", e => {
   //console.log(e.target);
   if (e.target.matches(".product *")){
       let price = e.target.parentElement.getAttribute("data-price");
       //console.log(priceID);

       Stripe(STRIPE_KEYS.public).redirectToCheckout({
           lineItems: [{price, quantity: 1}],
           mode: "subscription",
           successUrl: "http://127.0.0.1:5500/stripe-success.html",
           cancelUrl: "http://127.0.0.1:5500/stripe-cancel.html"
       }).then(res => {
           if (res.error){
               $products.insertAdjacentHTML("afterend", res.error.message);
               console.log(message);
           }
       });
   };
});

// fetch("https://api.stripe.com/v1/products",{
//     headers: {
//         Authorization: `Bearer ${STRIPE_KEYS.secret}`,
//     },
// })
//     .then((res)=>{
//         console.log(res);
//         return res.json();
//     })
//     .then((json)=>{
//         console.log(json);
//     });

// fetch("https://api.stripe.com/v1/prices",{
//     headers: {
//         Authorization: `Bearer ${STRIPE_KEYS.secret}`,
//     },
// })
//     .then((res)=>{
//         console.log(res);
//         return res.json();
//     })
//     .then((json)=>{
//         console.log(json);
//     });