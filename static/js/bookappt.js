const form = document.querySelector("form")
const analyzeBtn = document.getElementById("analyzeBtn")
const gotoDoctorBtn = document.querySelector(".gotoDoctorBtn")
const buttonText = analyzeBtn.querySelector(".button-text")
const spinner = analyzeBtn.querySelector(".spinner")
const symptomTextarea = document.getElementById("symptom")
const departmentSelect = document.getElementById("department-select")

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
  dental: "/departments/dental"
}
// Function to check if all required fields are filled and either symptom or department is selected
function checkFormValidity() {
  const name = document.getElementById("name").value.trim()
  const age = document.getElementById("age").value.trim()
  const email = document.getElementById("email").value.trim()
  const phone = document.getElementById("phone").value.trim()
  const symptom = symptomTextarea.value.trim()
  const selectedDepartment = departmentSelect.value

  const coreInfoFilled = name && age && email && phone
  const symptomOrDepartmentFilled = symptom || selectedDepartment

  analyzeBtn.disabled = !(coreInfoFilled && symptomOrDepartmentFilled)

  // Manage the "Go to Recommended Department" button
  if (selectedDepartment) {
    // If a department is selected from the dropdown
    gotoDoctorBtn.disabled = false
    const displayDepartment = selectedDepartment.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    gotoDoctorBtn.innerHTML = `<i class="fas fa-arrow-right"></i> Go to ${displayDepartment} Department`
    gotoDoctorBtn.onclick = () => handleRedirect(selectedDepartment)
  } else {
    // If no department is selected from the dropdown
    const hasResultSection = document.querySelector(".result-section .response-text")
    if (!hasResultSection) {
      // If no result from Flask, disable the button and reset text
      gotoDoctorBtn.disabled = true
      gotoDoctorBtn.innerHTML = `<i class="fas fa-arrow-right"></i> Go to Recommended Department`
      gotoDoctorBtn.onclick = null // Clear any previous onclick
    } else {
      // If there's a result from Flask, the button's onclick is already set by Flask.
      // We just need to ensure it's enabled.
      gotoDoctorBtn.disabled = false
      // The text and onclick are already set by Flask's template rendering.
      // No need to modify them here unless we want to override Flask's behavior.
      // For now, we assume Flask's initial rendering is correct for the result state.
    }
  }
}

// Function to handle redirection to department pages
function handleRedirect(department) {
  console.log("handleRedirect called with department:", department)

  // Normalize department string for lookup
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

// Initial check on page load
document.addEventListener("DOMContentLoaded", () => {
  checkFormValidity()
})

// Listen for input changes on the form to enable/disable the analyze button
form.addEventListener("input", checkFormValidity)

// Listen for changes on the department select dropdown
departmentSelect.addEventListener("change", checkFormValidity)

// Handle form submission
form.addEventListener("submit", () => {
  analyzeBtn.disabled = true
  buttonText.style.display = "none"
  spinner.style.display = "inline-block"
})
