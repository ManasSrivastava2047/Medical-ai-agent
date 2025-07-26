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
  // 🔍 Debug: Show the raw value passed from Flask/template
  console.log("handleRedirect called with original department:", department);

  // Normalize department to match keys in redirects object
  const normalizedDepartment = department.trim().toLowerCase().replace(/\s/g, "");

  // 🔍 Debug: Show normalized value
  console.log("Normalized department for lookup:", normalizedDepartment);

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
    dental: "/departments/dental"
  };

  const target = redirects[normalizedDepartment];

  // 🔍 Debug: Final URL being used
  console.log("Target URL found:", target);

  if (target) {
    window.location.href = target;
  } else {
    alert("Department not specifically matched. Redirecting to General Medicine.");
    window.location.href = "/departments/generalmedicine";
  }
}
