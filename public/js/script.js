ClassicEditor.create(document.querySelector("#editor")).catch((err) =>
  console.log(err)
);

document.querySelector("#confirm").onclick = function () {
  if (!confirm("Confirm deletion")) return false;
};

document.querySelector("#clear-cart").onclick = function () {
  if (!confirm("You want clear your cart?")) return false;
};

document.querySelector("#buynow").onclick = function (e) {
  e.preventDefault();
  console.log("clicked");
  // fetch("/cart/buynow").then((response) => {
  //   console.log(response);
  //   document.querySelector("#pay").click();
  // });
};


