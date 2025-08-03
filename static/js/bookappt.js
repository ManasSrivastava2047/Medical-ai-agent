const symptomForm = document.querySelector("form[action='/book']")
const analyzeBtn = document.getElementById("analyzeBtn")
const gotoDoctorBtn = document.querySelector(".gotoDoctorBtn")
const buttonText = analyzeBtn.querySelector(".button-text")
const spinner = analyzeBtn.querySelector(".spinner")
const symptomTextarea = document.getElementById("symptom")
const departmentSelect = document.getElementById("department-select")

// New elements for authentication
const showSignupBtn = document.getElementById("showSignupBtn")
const showLoginBtn = document.getElementById("showLoginBtn")
const signupForm = document.getElementById("signupForm")
const loginForm = document.getElementById("loginForm")
const signupMessage = document.getElementById("signup-message")
const loginMessage = document.getElementById("login-message")
const profileDisplay = document.getElementById("profile-display")

// Define the redirection map for departments
const redirects = {
  general: "/departments/general-medicine",
  "general medicine": "/departments/general-medicine",
  emergency: "/departments/emergency",
  "mental health": "/departments/mental_health",
  mentalhealth: "/departments/mental_health",
  cardiology: "/departments/cardiology",
  pulmonology: "/departments/pulmonology",
  gastroenterology: "/departments/gastroenterology",
  neurology: "/departments/neurology",
  orthopedics: "/departments/orthopedics",
  pediatrics: "/departments/pediatrics",
  gynecology: "/departments/gynecology",
  dermatology: "/departments/dermatology",
  ent: "/departments/ent",
  ophthalmology: "/departments/ophthalmology",
  urology: "/departments/urology",
  endocrinology: "/departments/endocrinology",
  oncology: "/departments/oncology",
  dental: "/departments/dental",
}

// Function to check if symptom form is valid
function checkSymptomFormValidity() {
  const symptom = symptomTextarea.value.trim()
  const selectedDepartment = departmentSelect.value

  analyzeBtn.disabled = !(symptom || selectedDepartment)

  // Manage the "Go to Recommended Department" button
  if (selectedDepartment) {
    gotoDoctorBtn.disabled = false
    const displayDepartment = selectedDepartment.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    gotoDoctorBtn.innerHTML = `<i class="fas fa-arrow-right"></i> Go to ${displayDepartment} Department`
    gotoDoctorBtn.onclick = () => handleRedirect(selectedDepartment)
  } else {
    const hasResultSection = document.querySelector(".result-section .response-text")
    if (!hasResultSection) {
      gotoDoctorBtn.disabled = true
      gotoDoctorBtn.innerHTML = `<i class="fas fa-arrow-right"></i> Go to Recommended Department`
      gotoDoctorBtn.onclick = null
    } else {
      gotoDoctorBtn.disabled = false
    }
  }
}

// Function to handle redirection to department pages
function handleRedirect(department) {
  console.log("handleRedirect called with department:", department)
  const normalizedDepartment = department.toLowerCase().trim()
  const target = redirects[normalizedDepartment]

  if (target) {
    console.log("Target URL found:", target)
    window.location.href = target
  } else {
    console.error("Redirect failed: No matching department for", normalizedDepartment)
    alert("Sorry, the department page could not be found.")
  }
}

// Function to display user info in the profile box
function displayUserProfile(user) {
  if (user && user.name) {
    profileDisplay.innerHTML = `
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Age:</strong> ${user.age} years</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Phone:</strong> ${user.phone}</p>
    `
  } else {
    profileDisplay.innerHTML = `<p class="placeholder-text">Please sign up or log in to see your details here.</p>`
  }
}

// Authentication UI functions
function showForm(formToShow) {
  signupForm.style.display = "none"
  loginForm.style.display = "none"
  signupMessage.textContent = ""
  loginMessage.textContent = ""

  if (formToShow === "signup") {
    signupForm.style.display = "block"
    showSignupBtn.classList.add("active")
    showLoginBtn.classList.remove("active")
  } else if (formToShow === "login") {
    loginForm.style.display = "block"
    showLoginBtn.classList.add("active")
    showSignupBtn.classList.remove("active")
  }
}

// Handle Signup Form Submission
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault()
  signupMessage.textContent = ""

  const formData = new FormData(signupForm)
  const data = Object.fromEntries(formData.entries())

  try {
    const response = await fetch("/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    const result = await response.json()

    if (response.ok) {
      signupMessage.textContent = result.message
      signupMessage.style.color = "var(--color-success)"
      signupForm.reset()
      // Optionally, automatically switch to login form after successful signup
      setTimeout(() => showForm("login"), 2000)
    } else {
      signupMessage.textContent = result.error || "Signup failed."
      signupMessage.style.color = "var(--color-error)"
    }
  } catch (error) {
    console.error("Error during signup:", error)
    signupMessage.textContent = "An unexpected error occurred."
    signupMessage.style.color = "var(--color-error)"
  }
})

// Handle Login Form Submission
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault()
  loginMessage.textContent = ""

  const formData = new FormData(loginForm)
  const data = Object.fromEntries(formData.entries())

  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    const result = await response.json()

    if (response.ok) {
      loginMessage.textContent = result.message
      loginMessage.style.color = "var(--color-success)"
      loginForm.reset()
      // Update profile display with logged-in user info
      displayUserProfile(result.user)
      // Optionally, hide auth forms after successful login
      showForm(null) // Hide all auth forms
    } else {
      loginMessage.textContent = result.error || "Login failed."
      loginMessage.style.color = "var(--color-error)"
    }
  } catch (error) {
    console.error("Error during login:", error)
    loginMessage.textContent = "An unexpected error occurred."
    loginMessage.style.color = "var(--color-error)"
  }
})

// Initial checks and event listeners
document.addEventListener("DOMContentLoaded", () => {
  checkSymptomFormValidity()

})

symptomForm.addEventListener("input", checkSymptomFormValidity)
departmentSelect.addEventListener("change", checkSymptomFormValidity)

// Handle symptom form submission (existing logic)
symptomForm.addEventListener("submit", () => {
  analyzeBtn.disabled = true
  buttonText.style.display = "none"
  spinner.style.display = "inline-block"
})

// Event listeners for new auth buttons
showSignupBtn.addEventListener("click", () => showForm("signup"))
showLoginBtn.addEventListener("click", () => showForm("login"))
