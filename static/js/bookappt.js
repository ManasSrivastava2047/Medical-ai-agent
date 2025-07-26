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
  console.log("handleRedirect called with original department:", department);

  const redirects = {
    general: "/departments/general-medicine",
    "general medicine": "/departments/general-medicine",
    emergency: "/departments/emergency",
    "mental health": "/departments/mental_health",
    psychiatry: "/departments/mental_health",
    cardiology: "/departments/cardiology",
    orthopedics: "/departments/orthopedics",
    neurology: "/departments/neurology"
    // Add other departments as needed
  };

  // Normalize department string to lowercase and trim
  const normalizedDepartment = department.toLowerCase().trim();
  console.log("Normalized department for lookup:", normalizedDepartment);

  const target = redirects[normalizedDepartment];

  if (target) {
    console.log("Target URL found:", target);
    window.location.href = target;
  } else {
    console.error("Redirect failed: No matching department for", normalizedDepartment);
    alert("Sorry, the department page could not be found.");
  }
}
