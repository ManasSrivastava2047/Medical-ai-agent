// Emergency Department JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Initialize real-time updates
  initializeRealTimeUpdates()

  // Initialize AI chat
  initializeAIChat()

  // Update status indicators periodically
  setInterval(updateDepartmentStatus, 30000) // Update every 30 seconds
})

// Triage System
function updateTriageLevel() {
  const checkboxes = document.querySelectorAll('.symptom-checkboxes input[type="checkbox"]')
  const triageResult = document.getElementById("triageResult")
  const triageLevel = document.getElementById("triageLevel")
  const triageAction = document.getElementById("triageAction")
  const registerBtn = document.getElementById("registerBtn")

  let criticalCount = 0
  let urgentCount = 0
  let standardCount = 0

  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      const parent = checkbox.closest(".checkbox-item")
      if (parent.classList.contains("critical")) {
        criticalCount++
      } else if (parent.classList.contains("urgent")) {
        urgentCount++
      } else if (parent.classList.contains("standard")) {
        standardCount++
      }
    }
  })

  if (criticalCount > 0) {
    triageLevel.textContent = "CRITICAL - Level 1"
    triageLevel.className = "triage-level critical"
    triageAction.innerHTML = `
      <strong>IMMEDIATE ATTENTION REQUIRED</strong><br>
      Please proceed directly to the Emergency Department or call 112 immediately. 
      Your symptoms indicate a potentially life-threatening condition that requires immediate medical intervention.
    `
    registerBtn.textContent = "Call 112 Now"
    registerBtn.onclick = () => window.open("tel:112")
    registerBtn.style.backgroundColor = "var(--color-critical)"
  } else if (urgentCount > 0) {
    triageLevel.textContent = "URGENT - Level 2"
    triageLevel.className = "triage-level urgent"
    triageAction.innerHTML = `
      <strong>URGENT CARE NEEDED</strong><br>
      Your symptoms require prompt medical attention. Please register for emergency care. 
      Expected wait time: 15-30 minutes.
    `
    registerBtn.textContent = "Register for Emergency Care"
    registerBtn.onclick = registerForTriage
    registerBtn.style.backgroundColor = "var(--color-urgent)"
  } else if (standardCount > 0) {
    triageLevel.textContent = "STANDARD - Level 3"
    triageLevel.className = "triage-level standard"
    triageAction.innerHTML = `
      <strong>STANDARD CARE</strong><br>
      Your symptoms can be addressed with standard emergency care. 
      Expected wait time: 45-90 minutes.
    `
    registerBtn.textContent = "Register for Care"
    registerBtn.onclick = registerForTriage
    registerBtn.style.backgroundColor = "#9c27b0"
  }

  if (criticalCount > 0 || urgentCount > 0 || standardCount > 0) {
    triageResult.style.display = "block"
  } else {
    triageResult.style.display = "none"
  }
}

function registerForTriage() {
  const triageLevel = document.getElementById("triageLevel").textContent
  const registerBtn = document.getElementById("registerBtn")

  // Simulate registration process
  registerBtn.disabled = true
  registerBtn.textContent = "Registering..."

  setTimeout(() => {
    registerBtn.textContent = "Registration Complete"
    registerBtn.style.backgroundColor = "var(--color-success)"

    // Show confirmation message
    const confirmationMsg = document.createElement("div")
    confirmationMsg.className = "registration-confirmation"
    confirmationMsg.innerHTML = `
      <div style="background-color: #d4edda; color: #155724; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
        <i class="fas fa-check-circle"></i>
        <strong>Registration Successful!</strong><br>
        Triage Level: ${triageLevel}<br>
        Registration ID: ER-${Date.now().toString().slice(-6)}<br>
        Please proceed to the Emergency Department reception.
      </div>
    `

    document.getElementById("triageResult").appendChild(confirmationMsg)
  }, 2000)
}

// Real-time Department Status Updates
function initializeRealTimeUpdates() {
  updateDepartmentStatus()
}

function updateDepartmentStatus() {
  // Simulate real-time data updates
  const availableBeds = document.getElementById("availableBeds")
  const ambulancesEnRoute = document.getElementById("ambulancesEnRoute")
  const avgWaitTime = document.getElementById("avgWaitTime")
  const activeStaff = document.getElementById("activeStaff")

  // Simulate realistic fluctuations
  const currentBeds = Number.parseInt(availableBeds.textContent)
  const newBeds = Math.max(8, Math.min(20, currentBeds + (Math.random() > 0.5 ? 1 : -1)))
  availableBeds.textContent = newBeds

  const currentAmbulances = Number.parseInt(ambulancesEnRoute.textContent)
  const newAmbulances = Math.max(0, Math.min(8, currentAmbulances + (Math.random() > 0.6 ? 1 : -1)))
  ambulancesEnRoute.textContent = newAmbulances

  const currentWait = Number.parseInt(avgWaitTime.textContent)
  const newWait = Math.max(5, Math.min(45, currentWait + (Math.random() > 0.5 ? 2 : -2)))
  avgWaitTime.textContent = newWait

  const currentStaff = Number.parseInt(activeStaff.textContent)
  const newStaff = Math.max(15, Math.min(22, currentStaff + (Math.random() > 0.8 ? 1 : 0)))
  activeStaff.textContent = newStaff

  // Update status indicators based on values
  updateStatusIndicators(newBeds, newAmbulances, newWait, newStaff)
}

function updateStatusIndicators(beds, ambulances, waitTime, staff) {
  const statusItems = document.querySelectorAll(".status-item")

  // Update bed availability indicator
  const bedIndicator = statusItems[0].querySelector(".status-indicator")
  if (beds >= 15) {
    bedIndicator.textContent = "Good Availability"
    bedIndicator.className = "status-indicator good"
  } else if (beds >= 10) {
    bedIndicator.textContent = "Limited Availability"
    bedIndicator.className = "status-indicator warning"
  } else {
    bedIndicator.textContent = "Low Availability"
    bedIndicator.className = "status-indicator warning"
  }

  // Update ambulance indicator
  const ambulanceIndicator = statusItems[1].querySelector(".status-indicator")
  if (ambulances >= 5) {
    ambulanceIndicator.textContent = "High Activity"
    ambulanceIndicator.className = "status-indicator warning"
  } else if (ambulances >= 2) {
    ambulanceIndicator.textContent = "Incoming Patients"
    ambulanceIndicator.className = "status-indicator warning"
  } else {
    ambulanceIndicator.textContent = "Normal Activity"
    ambulanceIndicator.className = "status-indicator good"
  }

  // Update wait time indicator
  const waitIndicator = statusItems[2].querySelector(".status-indicator")
  if (waitTime <= 20) {
    waitIndicator.textContent = "Below Target"
    waitIndicator.className = "status-indicator good"
  } else if (waitTime <= 35) {
    waitIndicator.textContent = "At Target"
    waitIndicator.className = "status-indicator warning"
  } else {
    waitIndicator.textContent = "Above Target"
    waitIndicator.className = "status-indicator warning"
  }

  // Update staff indicator
  const staffIndicator = statusItems[3].querySelector(".status-indicator")
  if (staff >= 20) {
    staffIndicator.textContent = "Fully Staffed"
    staffIndicator.className = "status-indicator excellent"
  } else if (staff >= 17) {
    staffIndicator.textContent = "Well Staffed"
    staffIndicator.className = "status-indicator good"
  } else {
    staffIndicator.textContent = "Adequate Staff"
    staffIndicator.className = "status-indicator warning"
  }
}

// AI Chat Functionality
function initializeAIChat() {
  const userInput = document.getElementById("user-input")
  const sendButton = document.getElementById("send-button")
  const chatMessages = document.getElementById("chat-messages")

  function addMessage(sender, message) {
    const messageDiv = document.createElement("div")
    messageDiv.classList.add("message", `${sender}-message`)
    messageDiv.textContent = message
    chatMessages.appendChild(messageDiv)
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  async function sendMessage() {
    const message = userInput.value.trim()
    if (!message) return

    addMessage("user", message)
    userInput.value = ""

    // Add typing indicator
    const typingIndicator = document.createElement("div")
    typingIndicator.classList.add("message", "ai-message")
    typingIndicator.innerHTML =
      '<i class="fas fa-circle"></i> <i class="fas fa-circle"></i> <i class="fas fa-circle"></i> AI is analyzing...'
    typingIndicator.style.fontStyle = "italic"
    typingIndicator.style.opacity = "0.7"
    chatMessages.appendChild(typingIndicator)
    chatMessages.scrollTop = chatMessages.scrollHeight

    try {
      const response = await fetch("/api/chat/emergency", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      chatMessages.removeChild(typingIndicator)
      addMessage("ai", data.response)
    } catch (error) {
      console.error("Error:", error)
      chatMessages.removeChild(typingIndicator)
      addMessage(
        "ai",
        "I apologize, but I'm currently unable to respond. In a medical emergency, please call 112 immediately or visit our Emergency Department directly.",
      )
    }
  }

  sendButton.addEventListener("click", sendMessage)
  userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      sendMessage()
    }
  })
}

// Utility function to format time
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// Emergency contact functions
function callEmergency() {
  window.open("tel:112")
}

function callHospital() {
  window.open("tel:5551234567") // Replace with actual hospital number
}

// Ring Department Function (updated for new layout)
function ringDepartment() {
  const phoneNumber = "5551234567" // Replace with actual emergency department number

  // Show confirmation dialog
  const confirmed = confirm(
    "You are about to call the Emergency Department directly.\n\n" +
      "Phone: (555) 123-EMRG\n\n" +
      "• For life-threatening emergencies, use the 112 button\n" +
      "• For general inquiries, wait times, or directions\n\n" +
      "Do you want to proceed with the call?",
  )

  if (confirmed) {
    // Add visual feedback to the department button
    const deptBtn = document.querySelector(".emergency-call-btn.department")
    const originalContent = deptBtn.innerHTML

    deptBtn.innerHTML = `
      <i class="fas fa-phone-alt fa-shake"></i>
      <div class="btn-content">
        <span class="btn-title">Calling...</span>
        <span class="btn-subtitle">Connecting...</span>
      </div>
    `

    // Disable button temporarily
    deptBtn.disabled = true
    deptBtn.style.opacity = "0.8"

    // Initiate the call
    window.open(`tel:${phoneNumber}`)

    // Reset button after 3 seconds
    setTimeout(() => {
      deptBtn.innerHTML = originalContent
      deptBtn.disabled = false
      deptBtn.style.opacity = "1"
    }, 3000)
  }
}

// Alternative function for mobile devices with better UX
function ringDepartmentMobile() {
  const phoneNumber = "5551234567"

  // For mobile devices, show a more mobile-friendly confirmation
  if (confirm("Call Emergency Department?\n(555) 123-EMRG")) {
    window.location.href = `tel:${phoneNumber}`
  }
}

// Detect if user is on mobile and use appropriate function
function detectMobileAndRing() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  if (isMobile) {
    ringDepartmentMobile()
  } else {
    ringDepartment()
  }
}
