// Gynecology Department JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Initialize AI chat
  initializeAIChat()
  // Initialize Dark Mode
  initializeDarkMode()
  // Initialize FAQ Accordion
  initializeFAQAccordion()
  // Initialize Booking
  initializeBooking()
})

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
      const response = await fetch("/api/chat/gynecology", {
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
        "I apologize, but I'm currently unable to respond. For any medical concerns, please consult a healthcare professional directly.",
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

// Dark Mode Toggle Functionality
function initializeDarkMode() {
  const darkModeToggle = document.getElementById("dark-mode-toggle")

  function enableDarkMode() {
    document.body.setAttribute("data-theme", "dark")
    localStorage.setItem("theme", "dark")
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode'
  }

  function disableDarkMode() {
    document.body.removeAttribute("data-theme")
    localStorage.setItem("theme", "light")
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode'
  }

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme === "dark") {
    enableDarkMode()
  } else {
    disableDarkMode() // Ensure light mode is default if no preference or 'light'
  }

  darkModeToggle.addEventListener("click", () => {
    if (document.body.getAttribute("data-theme") === "dark") {
      disableDarkMode()
    } else {
      enableDarkMode()
    }
  })
}

// FAQ Accordion Functionality
function initializeFAQAccordion() {
  const faqQuestions = document.querySelectorAll(".faq-question")

  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      const answer = question.nextElementSibling
      const isExpanded = question.getAttribute("aria-expanded") === "true"

      // Close all other open answers
      faqQuestions.forEach((otherQuestion) => {
        if (otherQuestion !== question && otherQuestion.getAttribute("aria-expanded") === "true") {
          otherQuestion.setAttribute("aria-expanded", "false")
          otherQuestion.nextElementSibling.style.display = "none"
        }
      })

      // Toggle current answer
      if (!isExpanded) {
        question.setAttribute("aria-expanded", "true")
        answer.style.display = "block"
      } else {
        question.setAttribute("aria-expanded", "false")
        answer.style.display = "none"
      }
    })
  })
}

// Booking Appointment Functionality (Client-side simulation)
function initializeBooking() {
  const bookButtons = document.querySelectorAll(".book-btn")
  const appointmentList = document.getElementById("appointment-list")
  const noAppointmentsMessage = document.getElementById("no-appointments-message")

  // Function to update the visibility of the "No appointments" message
  function updateNoAppointmentsMessage() {
    if (appointmentList.children.length === 0) {
      noAppointmentsMessage.style.display = "block"
    } else {
      noAppointmentsMessage.style.display = "none"
    }
  }

  // Initial check
  updateNoAppointmentsMessage()

  bookButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const doctorName = button.dataset.doctor
      const reason = prompt(`Booking appointment with ${doctorName}. What is the reason for your visit?`)

      if (reason) {
        const date = new Date()
        const formattedDate = date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
        const formattedTime = date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })

        const newAppointmentItem = document.createElement("li")
        newAppointmentItem.classList.add("appointment-item")
        newAppointmentItem.innerHTML = `
          <div class="appointment-details">
            <h3>Appointment with ${doctorName}</h3>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Reason:</strong> ${reason}</p>
          </div>
          <span class="appointment-status status-pending">Pending Confirmation</span>
        `
        appointmentList.appendChild(newAppointmentItem)
        alert(
          `Appointment with ${doctorName} for "${reason}" on ${formattedDate} at ${formattedTime} has been requested.`,
        )
        updateNoAppointmentsMessage()
      } else {
        alert("Appointment booking cancelled.")
      }
    })
  })
}
