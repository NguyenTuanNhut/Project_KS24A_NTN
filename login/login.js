let userList = JSON.parse(localStorage.getItem("userList")) || [];
const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");

signUpButton.addEventListener("click", () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
});

// Kiểm tra nếu đã đăng nhập thì chuyển hướng
function authenCheck() {
  if (localStorage.getItem("userLogin")) {
    window.location.href = "/";
  }
}
authenCheck();
// Hàm lấy dữ liệu từ form
function getFormData(formElement) {
  const formData = new FormData(formElement);
  const data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value.trim();
  }
  return data;
}

// Hàm kiểm tra định dạng email
function ValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Đăng ký tài khoản
function register(event) {
  event.preventDefault();
  let form = event.target;
  let data = getFormData(form);

  // Xóa lỗi cũ
  document
    .querySelectorAll("form p")
    .forEach((el) => el.classList.remove("error"));

  let hasError = false;

  if (data.lastName == "") {
    document.getElementById("lastName-error").classList.add("error");
    hasError = true;
  }
  if (data.name == "") {
    document.getElementById("name-error").classList.add("error");
    hasError = true;
  }
  if (data.email == "") {
    document.getElementById("email-error0").classList.add("error");
    hasError = true;
  } else if (!ValidEmail(data.email)) {
    document.getElementById("email-error1").classList.add("error");
    hasError = true;
  } else if (userList.find((user) => user.email === data.email)) {
    document.getElementById("email-error2").classList.add("error");
    hasError = true;
  }

  if (data.password == "") {
    document.getElementById("password-error1").classList.add("error");
    hasError = true;
  } else if (data.password.length < 8) {
    document.getElementById("password-error2").classList.add("error");
    hasError = true;
  } else if (data.password !== data.confirmPassword) {
    document.getElementById("password-error0").classList.add("error");
    hasError = true;
  }

  if (hasError) return;

  data.role = "user";
  userList.push(data);
  localStorage.setItem("userList", JSON.stringify(userList));
  alert("đăng kí thành công");
  window.location.href = "/login//signin.html";
  form.reset();
}
// Đăng nhập
function checkSignIn(event) {
  event.preventDefault();
  let hasError;
  let form = event.target;
  let inputs = form.querySelectorAll("input");
  let email = inputs[0].value.trim();
  let password = inputs[1].value;
  document
    .querySelectorAll("form p")
    .forEach((el) => el.classList.remove("error"));
  let user = userList.find((u) => u.email === email);

  if (email == "") {
    document.getElementById("email-error").classList.add("error");
    hasError = true;
  } else if (!user) {
    document.getElementById("email-error1").classList.add("error");
    hasError = true;
  }

  if (password == "") {
    document.getElementById("password-error").classList.add("error");
    hasError = true;
  } else if (user.password !== password) {
    document.getElementById("password-error1").classList.add("error");
    hasError = true;
  }

  if (hasError) {
    return;
  }

  // Kiểm tra nếu là tài khoản admin
  if (user.role === "admin") {
    alert("Đăng nhập thành công với tài khoản admin");
    window.location.href = "/ProductCategory/statistics.html";
  } else {
    alert("Đăng nhập thành công");
    window.location.href = "/home/index.html";
  }
}
