// Khi trang tải xong, lấy danh sách danh mục từ localStorage và hiển thị trong ô chọn
window.onload = function () {
  const productCategorySelect = document.getElementById("productCategory");
  const storedCategories = JSON.parse(localStorage.getItem("categories")) || [];

  // Xóa các lựa chọn cũ
  productCategorySelect.innerHTML = "";

  // Thêm các danh mục vào ô chọn
  storedCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    productCategorySelect.appendChild(option);
  });

  renderData();
};

let flag = true;

// Mở modal: nếu đang thêm mới thì đặt lại form và button, nếu sửa thì giữ nguyên
function openModal() {
  const form = document.getElementById("addProductForm");
  if (flag) {
    document.getElementById("editButton").textContent = "Thêm";
    form.reset();
  } else {
    document.getElementById("editButton").textContent = "Cập nhật";
  }
  document.getElementById("productModal").classList.remove("d-none");
}

// Đóng modal và reset trạng thái về thêm mới
function closeModal() {
  document.getElementById("productModal").classList.add("d-none");
  flag = true;
}

// Lấy dữ liệu sản phẩm từ localStorage hoặc tạo mảng rỗng nếu chưa có
let products = JSON.parse(localStorage.getItem("products")) || [];
const ITEMS_PER_PAGE = 10;
let currentPage = 1;

// Xử lý sự kiện khi submit form thêm/sửa sản phẩm
document
  .getElementById("addProductForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    addProduct(e);
  });

// Hàm thêm hoặc cập nhật sản phẩm
function addProduct(event) {
  const form = event.target;
  const id = form.productId.value.trim();
  const editingId = form.dataset.editingId;
  const isEdit = form.dataset.mode === "edit";

  const updatedProduct = {
    id,
    name: form.productName.value.trim(),
    category: form.productCategory.value,
    status: form.status.value,
    quantity: Number(form.productQuantity.value),
    price: Number(form.productPrice.value),
    discount: Number(form.productDiscount.value),
    image: form.productImage.value.trim(),
    description: form.productDescription.value.trim(),
  };

  if (!id) {
    alert("Bạn phải nhập ID sản phẩm.");
    return;
  }

  if (!isEdit && products.some((product) => product.id === id)) {
    alert("Sản phẩm với ID này đã tồn tại.");
    return;
  }

  if (isEdit) {
    const index = products.findIndex((p) => p.id === editingId);
    if (index !== -1) {
      products[index] = updatedProduct;
    }
  } else {
    products.push(updatedProduct);
  }

  localStorage.setItem("products", JSON.stringify(products));
  form.reset();
  form.dataset.mode = "";
  form.dataset.editingId = "";
  document.getElementById("productId").readOnly = false;

  closeModal();
  renderData();
}

// Hiển thị danh sách sản phẩm theo trang hiện tại
function renderData(data = products) {
  const tbody = document.querySelector("table tbody");
  tbody.innerHTML = "";

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

// Hiển thị phân trang theo số sản phẩm và trang hiện tại
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

// Xoá sản phẩm khỏi danh sách và cập nhật localStorage
function deleteProduct(id) {
  const confirmDelete = confirm("Bạn có chắc chắn muốn xóa sản phẩm này?");
  if (!confirmDelete) return;
  products = products.filter((product) => product.id !== id);
  localStorage.setItem("products", JSON.stringify(products));

  // Nếu trang hiện tại không còn sản phẩm nào thì quay lại trang trước nếu có
  const maxPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  if (currentPage > maxPages) {
    currentPage = maxPages;
  }
  renderData();
}

// Hiển thị dữ liệu sản phẩm lên form để chỉnh sửa
function editProduct(id) {
  flag = false;
  const product = products.find((p) => p.id === id);
  if (!product) return;

  const form = document.getElementById("addProductForm");
  form.reset();
  form.dataset.mode = "edit";
  form.dataset.editingId = id;

  form.productId.value = product.id;
  form.productName.value = product.name;
  form.productCategory.value = product.category;
  form.productQuantity.value = product.quantity;
  form.productPrice.value = product.price;
  form.productDiscount.value = product.discount;
  form.productImage.value = product.image;
  form.productDescription.value = product.description;

  if (product.status === "active") {
    document.getElementById("statusActive").checked = true;
  } else {
    document.getElementById("statusInactive").checked = true;
  }

  document.getElementById("productId").readOnly = true;
  openModal();
  document.getElementById("editButton").textContent = "Cập nhật";
}
