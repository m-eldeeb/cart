// image perview
const input = document.querySelector("#input-img");
const image = document.querySelector("#imgPreview");

function readURL(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      image.setAttribute("src", e.target.result);
    };
    reader.readAsDataURL(input.files[0]);
  }
}
input.onchange = function () {
  readURL(this);
};

Dropzone.options.myGreatDropzone = {
  autoProcessQueue: true,
  paramName: "file", // The name that will be used to transfer the file
  maxFilesize: 10, // MB
  acceptedFiles: "image/*",
  init: function () {
    this.on("addedfile", function (file) {
      setTimeout(function () {
        location.reload();
      }, 1000);
    });
  },
};

