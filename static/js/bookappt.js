const form = document.querySelector("form")
const analyzeBtn = document.getElementById("analyzeBtn")
const gotoDoctorBtn = document.querySelector(".gotoDoctorBtn") // Select the button
const buttonText = analyzeBtn.querySelector(".button-text")
const spinner = analyzeBtn.querySelector(".spinner")

// Function to check if all required fields are filled
function checkFormValidity() {
  const requiredInputs = form.querySelectorAll("[required]")
  let allFilled = true
  requiredInputs.forEach((input) => {
    if (!input.value.trim()) {
      allFilled = false
    }
  })
  analyzeBtn.disabled = !allFilled
}

// Initial check on page load
document.addEventListener("DOMContentLoaded", () => {
  checkFormValidity()
  // Ensure gotoDoctorBtn is disabled if no result is present initially
  if (!document.querySelector(".response-text")) {
    // Check if the result element exists
    gotoDoctorBtn.disabled = true
  }
})

// Listen for input changes on the form to enable/disable the analyze button
form.addEventListener("input", checkFormValidity)

// Handle form submission
form.addEventListener("submit", () => {
  analyzeBtn.disabled = true
  buttonText.style.display = "none"
  spinner.style.display = "inline-block"
})

// Function to handle redirection to department pages
function handleRedirect(department) {
  // --- DEBUGGING START ---
  console.log("handleRedirect called with original department:", department)
  // --- DEBUGGING END ---

  // IMPORTANT: Normalize the department name by trimming, lowercasing, AND removing all spaces.
  // This ensures it matches the keys in the 'redirects' object, which are consistent with Python's slug format.
  const normalizedDepartment = department.trim().toLowerCase().replace(/\s/g, "")

  // --- DEBUGGING START ---
  console.log("Normalized department for lookup:", normalizedDepartment)
  // --- DEBUGGING END ---

  const redirects = {
    general: "/departments/generalmedicine",
    emergency: "/departments/emergency",
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
    psychiatry: "/departments/psychiatry",
    urology: "/departments/urology",
    endocrinology: "/departments/endocrinology",
    oncology: "/departments/oncology",
    dental: "/departments/dental",
    // Add other departments here as you create their files
  }

  const target = redirects[normalizedDepartment]

  // --- DEBUGGING START ---
  console.log("Redirects object:", redirects)
  console.log("Target URL found:", target)
  // --- DEBUGGING END ---

  if (target) {
    window.location.href = target
  } else {
    // Fallback to general medicine if no specific match is found
    alert("Department not specifically matched. Redirecting to General Medicine.")
    window.location.href = "/departments/generalmedicine"
  }
}
