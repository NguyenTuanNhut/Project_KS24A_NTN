const ITEMS_PER_PAGE = 10;
let currentPage = 1;
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let editingCategoryId = null;

// Hiển thị modal
function openModal() {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("modal").style.display = "block";
}

// Đóng modal và reset form
function closeModal() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("modal").style.display = "none";
  document.getElementById("button-submit").textContent = "Thêm";
  editingCategoryId = null;
  document.querySelector("form").reset();
  clearValidation();
}

// Xóa thông báo lỗi
function clearValidation() {
  document.getElementById("maDanhMuc").classList.remove("input-error");
  document.getElementById("tenDanhMuc").classList.remove("input-error");
  document.getElementById("id-error").style.display = "none";
  document.getElementById("name-error").style.display = "none";
}

// Thêm hoặc cập nhật danh mục
function addCategory(event) {
  event.preventDefault();

  let idCate = event.target.idCate.value.trim();
  let name = event.target.name.value.trim();
  const statusValue = document.querySelector(
    'input[name="status"]:checked'
  ).value;

  let isValid = true;

  // Kiểm tra trường rỗng
  if (idCate === "") {
    document.getElementById("maDanhMuc").classList.add("input-error");
    document.getElementById("id-error").style.display = "block";
    isValid = false;
  } else {
    document.getElementById("maDanhMuc").classList.remove("input-error");
    document.getElementById("id-error").style.display = "none";
  }

  if (name === "") {
    document.getElementById("tenDanhMuc").classList.add("input-error");
    document.getElementById("name-error").style.display = "block";
    isValid = false;
  } else {
    document.getElementById("tenDanhMuc").classList.remove("input-error");
    document.getElementById("name-error").style.display = "none";
  }

  // Kiểm tra trùng lặp khi thêm mới
  if (!editingCategoryId) {
    const duplicateId = categories.some((c) => c.id === idCate);
    const duplicateName = categories.some(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicateId) {
      document.getElementById("maDanhMuc").classList.add("input-error");
      document.getElementById("id-error2").style.display = "block";
      isValid = false;
    } else {
      document.getElementById("id-error2").style.display = "none";
    }

    if (duplicateName) {
      document.getElementById("tenDanhMuc").classList.add("input-error");
      document.getElementById("name-error2").style.display = "block";
      isValid = false;
    } else {
      document.getElementById("name-error2").style.display = "none";
    }
  }

  if (!isValid) return;

  const categoryData = {
    id: idCate,
    name: name,
    status: statusValue === "true",
  };

  // Nếu đang chỉnh sửa thì cập nhật, ngược lại thêm mới
  if (editingCategoryId) {
    const index = categories.findIndex((c) => c.id === editingCategoryId);
    if (index !== -1) categories[index] = categoryData;
  } else {
    categories.push(categoryData);
  }

  localStorage.setItem("categories", JSON.stringify(categories));
  closeModal();
  renderCategories();
}

// Hiển thị danh sách danh mục
function renderCategories(newFil = categories) {
  const tbody = document.querySelector("table tbody");
  tbody.innerHTML = "";

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCategories = newFil.slice(startIndex, endIndex);

  paginatedCategories.forEach((category) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${category.id}</td>
      <td>${category.name}</td>
      <td>
        <span class="${category.status ? "status-active" : "status-inactive"}">
          ${category.status ? "Đang hoạt động" : "Ngưng hoạt động"}
        </span>
      </td>
      <td class="text-center">
        <button class="btn btn-sm btn-warning" onclick="openEditModal('${
          category.id
        }')">
          <i class="fa-solid fa-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteCategory('${
          category.id
        }')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });

  renderPagination(newFil);
}

// Mở modal chỉnh sửa danh mục
function openEditModal(categoryId) {
  const category = categories.find((c) => c.id === categoryId);

  if (category) {
    document.getElementById("maDanhMuc").value = category.id;
    document.getElementById("tenDanhMuc").value = category.name;
    document.querySelector(
      `input[name="status"][value="${category.status}"]`
    ).checked = true;
    editingCategoryId = categoryId;
    document.getElementById("button-submit").textContent = "Lưu";
    openModal();
  }
}

// Xóa danh mục (nếu không liên kết sản phẩm)
function deleteCategory(categoryId) {
  const categoryCheck = categories.find((c) => c.id === categoryId);
  const productsInStorage = JSON.parse(localStorage.getItem("products")) || [];

  // Kiểm tra danh mục có sản phẩm không
  const hasProduct = productsInStorage.some(
    (p) => p.category === categoryCheck.name
  );

  if (hasProduct) {
    alert("Không thể xóa vì có sản phẩm thuộc danh mục này.");
    return;
  }

  if (window.confirm("Bạn có chắc chắn muốn xoá danh mục này?")) {
    categories = categories.filter((c) => c.id !== categoryId);
    localStorage.setItem("categories", JSON.stringify(categories));
    renderCategories();
  }
}

// Áp dụng bộ lọc theo trạng thái và từ khóa
function applyFilters() {
  const statusValue = document.getElementById("status").value;
  const keyword = document
    .querySelector('input[type="text"]')
    .value.trim()
    .toLowerCase();

  let filtered = categories;

  if (statusValue !== "") {
    const isActive = statusValue === "true";
    filtered = filtered.filter((category) => category.status === isActive);
  }

  if (keyword !== "") {
    filtered = filtered.filter((category) =>
      category.name.toLowerCase().includes(keyword)
    );
  }

  currentPage = 1;
  renderCategories(filtered);
}

// Sắp xếp danh mục theo tên
function sortByName(order = "asc") {
  const sortedCategories = [...categories].sort((a, b) => {
    return order === "asc"
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  });

  currentPage = 1;
  renderCategories(sortedCategories);
}

// Hiển thị phân trang
function renderPagination(newFil = categories) {
  const pagination = document.querySelector(".pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(newFil.length / ITEMS_PER_PAGE);

  // Nút "Trước"
  const prevItem = document.createElement("li");
  prevItem.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prevItem.innerHTML = `<a class="page-link" href="#">Trước</a>`;
  prevItem.onclick = function (e) {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderCategories(newFil);
    }
  };
  pagination.appendChild(prevItem);

  // Các nút số trang
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.className = `page-item ${currentPage === i ? "active" : ""}`;
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageItem.onclick = function (e) {
      e.preventDefault();
      currentPage = i;
      renderCategories(newFil);
    };
    pagination.appendChild(pageItem);
  }

  // Nút "Sau"
  const nextItem = document.createElement("li");
  nextItem.className = `page-item ${
    currentPage === totalPages ? "disabled" : ""
  }`;
  nextItem.innerHTML = `<a class="page-link" href="#">Sau</a>`;
  nextItem.onclick = function (e) {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      renderCategories(newFil);
    }
  };
  pagination.appendChild(nextItem);
}

renderCategories();
