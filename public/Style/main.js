let list = document.querySelectorAll(".navigation li");

function activeLink() {
  list.forEach((item) => {
    item.classList.remove("hovered");
  });
  this.classList.add("hovered");
}

let toggle = document.querySelector(".menu-btn");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};

$(document).ready(function () {
  //jquery for toggle sub menus
  $(".sub-btn").click(function () {
    $(this).next(".sub-menu").slideToggle();
    $(this).find(".dropdown").toggleClass("rotate");
  });

  // jQuery for expand and collapse the sidebar
  $(".menu-btn").click(function () {
    $(".side-bar").addClass("active");
    $(".menu-btn").css("visibility", "hidden");
    $(".navigation").addClass("active"); // Corrected to use addClass
    $(".main").addClass("active"); // Corrected to use addClass
  });

  $(".close-btn").click(function () {
    $(".side-bar").removeClass("active");
    $(".menu-btn").css("visibility", "visible");
    $(".navigation").removeClass("active"); // Corrected to use removeClass
    $(".main").removeClass("active"); // Corrected to use removeClass
  });
});

function menuToggle() {
  const toggleMenu = document.querySelector(".menu-top");
  toggleMenu.classList.toggle("active");
}

$(".profile").click(function () {
  $(".menu-top").toggleClass("active");
});






//=================================================================================================Product-item JS
let preveiwContainer = document.querySelector(".products-preview");
if(preveiwContainer) {
  let previewBox = preveiwContainer.querySelectorAll(".preview");

  document.querySelectorAll(".products-container .product").forEach((product) => {
    product.onclick = () => {
      preveiwContainer.style.display = "flex";
      let name = product.getAttribute("data-name");
      previewBox.forEach((preview) => {
        let target = preview.getAttribute("data-target");
        if (name == target) {
          preview.classList.add("active");
        }
      });
    };
  });
  
  previewBox.forEach((close) => {
    close.querySelector(".fa-times").onclick = () => {
      close.classList.remove("active");
      preveiwContainer.style.display = "none";
    };
  });
}
