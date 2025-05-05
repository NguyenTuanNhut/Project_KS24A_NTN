window.onload = function () {
  const productCategorySelect = document.getElementById("productCategory");
  const storedCategories = JSON.parse(localStorage.getItem("categories")) || [];

  // Clear options
  productCategorySelect.innerHTML = "";

  // Add category options
  storedCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    productCategorySelect.appendChild(option);
  });

  renderData();
};

function openModal() {
  document.getElementById("productModal").classList.remove("d-none");
}

function closeModal() {
  document.getElementById("productModal").classList.add("d-none");
}

var products = JSON.parse(localStorage.getItem("products")) || [];
const ITEMS_PER_PAGE = 10;
let currentPage = 1;

document
  .getElementById("addProductForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    addProduct(e);
  });

function addProduct(event) {
  const form = event.target;

  const newProduct = {
    id: form.productId.value.trim(),
    name: form.productName.value.trim(),
    category: form.productCategory.value,
    status: form.status.value,
    quantity: Number(form.productQuantity.value),
    price: Number(form.productPrice.value),
    discount: Number(form.productDiscount.value),
    image: form.productImage.value.trim(),
    description: form.productDescription.value.trim(),
  };

  // Validate ID
  if (!newProduct.id) {
    alert("Bạn phải nhập ID sản phẩm.");
    return;
  }

  // Kiểm tra ID trùng
  if (products.some((product) => product.id === newProduct.id)) {
    alert("Sản phẩm với ID này đã tồn tại.");
    return;
  }

  products.push(newProduct);
  localStorage.setItem("products", JSON.stringify(products));

  form.reset();
  closeModal();
  renderData();
}

function renderData(data = products) {
  const tbody = document.querySelector("table tbody");
  tbody.innerHTML = "";

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginated = data.slice(startIndex, endIndex);

  paginated.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.price.toLocaleString()} đ</td>
      <td>${product.quantity}</td>
      <td>${product.discount}%</td>
      <td>
        <span class="${
          product.status === "active" ? "status-active" : "status-inactive"
        }">
          ${product.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
        </span>
      </td>
      <td class="text-center">
        <button class="btn btn-sm btn-warning" onclick="editProduct('${
          product.id
        }')">
          <i class="fa-solid fa-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${
          product.id
        }')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });

  renderPagination(data);
}

function renderPagination(data) {
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const pagination = document.querySelector(".pagination");
  pagination.innerHTML = "";

  const createPageItem = (label, page, disabled = false, active = false) => {
    const li = document.createElement("li");
    li.className = `page-item ${disabled ? "disabled" : ""} ${
      active ? "active" : ""
    }`;
    const a = document.createElement("a");
    a.className = "page-link";
    a.href = "#";
    a.textContent = label;
    a.onclick = (e) => {
      e.preventDefault();
      if (!disabled && currentPage !== page) {
        currentPage = page;
        renderData();
      }
    };
    li.appendChild(a);
    return li;
  };

  pagination.appendChild(
    createPageItem("Trước", currentPage - 1, currentPage === 1)
  );

  for (let i = 1; i <= totalPages; i++) {
    pagination.appendChild(createPageItem(i, i, false, i === currentPage));
  }

  pagination.appendChild(
    createPageItem("Sau", currentPage + 1, currentPage === totalPages)
  );
}
function deleteProduct(id) {
  const confirmDelete = confirm("Bạn có chắc chắn muốn xóa sản phẩm này?");
  if (!confirmDelete) return;
  products = products.filter((product) => product.id !== id);
  localStorage.setItem("products", JSON.stringify(products));
  renderData();
}
