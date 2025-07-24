const form = document.querySelector("form")
const analyzeBtn = document.getElementById("analyzeBtn")

form.addEventListener("input", () => {
  analyzeBtn.disabled = false
})
function handleRedirect(department) {
  const redirects = {
    general: "/departments/generalmedicine",
    emergency: "/departments/emergency",
    "mental health": "/departments/mental_health",
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
  }

  const target = redirects[department.trim().toLowerCase()]
  if (target) {
    window.location.href = target
  } else {
    alert("Department not specifically matched. Redirecting to General Medicine.")
    window.location.href = "/departments/general-medicine"
  }
}
