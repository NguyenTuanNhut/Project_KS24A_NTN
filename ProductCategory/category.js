let categories = JSON.parse(localStorage.getItem("categories")) || [];
let editingCategoryId = null;

function openModal() {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("modal").style.display = "none";
  document.getElementById("button-submit").textContent = "Thêm";
  editingCategoryId = null;
  document.querySelector("form").reset();
  clearValidation();
}

function clearValidation() {
  document.getElementById("maDanhMuc").classList.remove("input-error");
  document.getElementById("tenDanhMuc").classList.remove("input-error");
  document.getElementById("id-error").style.display = "none";
  document.getElementById("name-error").style.display = "none";
}

function addCategory(event) {
  event.preventDefault();

  let idCate = event.target.idCate.value.trim();
  let name = event.target.name.value.trim();
  const statusValue = document.querySelector(
    'input[name="status"]:checked'
  ).value;

  let isValid = true;

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

  if (!isValid) return;

  const categoryData = {
    id: idCate,
    name: name,
    status: statusValue === "true",
  };

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

function renderCategories(newFil = categories) {
  const tbody = document.querySelector("table tbody");
  tbody.innerHTML = "";

  newFil.forEach((category) => {
    const row = document.createElement("tr");

    row.innerHTML = `
          <td>${category.id}</td>
          <td>${category.name}</td>
          <td>
            <span class="${
              category.status ? "status-active" : "status-inactive"
            }">
              ${category.status ? "Đang hoạt động" : "Ngưng hoạt động"}
            </span>
          </td>
          <td class="text-center">
            <button class="btn btn-sm btn-warning" onclick="openEditModal('${
              category.id
            }')">✏️</button>
            <button class="btn btn-sm btn-danger" onclick="deleteCategory('${
              category.id
            }')">🗑️</button>
          </td>
        `;

    tbody.appendChild(row);
  });
}

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

function deleteCategory(categoryId) {
  if (window.confirm("bạn có chắc chắn muốn xoá?")) {
    categories = categories.filter((c) => c.id !== categoryId);
    localStorage.setItem("categories", JSON.stringify(categories));
    renderCategories();
  }
}
function filterStatus() {
  const onStatus = document.getElementById("status").value;

  let statusList;
  if (onStatus === "") {
    statusList = categories;
  } else {
    const isActive = onStatus === "true";
    statusList = categories.filter(
      (categorie) => categorie.status === isActive
    );
  }

  renderCategories(statusList);
}

renderCategories();
