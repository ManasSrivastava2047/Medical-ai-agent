// Merged content from general-medicine.js and general-medicine-chat.js
// (This will be identical for all departments)
function increment(id) {
  const span = document.getElementById(id)
  let count = Number.parseInt(span.innerText)
  count++ // Increment the count
  span.innerText = count // Update the displayed count

  const waitTimeInSeconds = Math.floor(count * 7.5 * 60) // Calculate wait time based on new count

  const buttons = document.querySelectorAll(".wait-btn")

  buttons.forEach((btn) => {
    btn.disabled = true
    btn.style.cursor = "not-allowed"

    // Check if this is the button that was clicked
    if (btn === event.target) {
      btn.innerText = "Booked"
      btn.style.backgroundColor = "var(--color-error)" // Use CSS variable for consistency

      // Add or update estimated wait time display
      const parent = btn.parentElement
      let waitInfo = parent.querySelector(".wait-time")
      if (!waitInfo) {
        waitInfo = document.createElement("p")
        waitInfo.className = "wait-time"
        parent.appendChild(waitInfo)
      }
      startCountdown(waitTimeInSeconds, waitInfo, btn)
    } else {
      btn.innerText = "Locked"
      btn.style.backgroundColor = "var(--color-disabled)" // Use CSS variable
    }
  })
}

function startCountdown(seconds, displayElement, buttonElement) {
  const timer = setInterval(() => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60

    displayElement.innerText = `Estimated Wait Time: ${mins} min ${secs < 10 ? "0" + secs : secs} sec`

    if (seconds <= 0) {
      clearInterval(timer)
      displayElement.innerText = "Your turn is approaching!" // More encouraging message
      buttonElement.innerText = "Check for your turn"
      buttonElement.style.backgroundColor = "var(--color-success)" // Use CSS variable
      buttonElement.disabled = false // Re-enable button for checking
      buttonElement.style.cursor = "pointer"
    }

    seconds--
  }, 1000)
}

// --- AI Chat Functionality ---
document.addEventListener("DOMContentLoaded", () => {
  const userInput = document.getElementById("user-input")
  const sendButton = document.getElementById("send-button")
  const chatMessages = document.getElementById("chat-messages")
  const darkModeToggle = document.getElementById("dark-mode-toggle")
  const faqQuestions = document.querySelectorAll(".faq-question")

  // Function to add a message to the chat display
  function addMessage(sender, message) {
    const messageDiv = document.createElement("div")
    messageDiv.classList.add("message", `${sender}-message`)
    messageDiv.textContent = message
    chatMessages.appendChild(messageDiv)
    chatMessages.scrollTop = chatMessages.scrollHeight // Scroll to bottom
  }

  // Function to send message to AI
  async function sendMessage() {
    const message = userInput.value.trim()
    if (!message) return

    addMessage("user", message)
    userInput.value = "" // Clear input

    // Add a "typing" indicator
    const typingIndicator = document.createElement("div")
    typingIndicator.classList.add("message", "ai-message", "typing-indicator")
    typingIndicator.textContent = "AI is typing..."
    chatMessages.appendChild(typingIndicator)
    chatMessages.scrollTop = chatMessages.scrollHeight

    try {
      // Assuming the Python backend has an endpoint for each department
      const response = await fetch("/api/chat/cardiology", {
        // Adjusted endpoint for cardiology
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
      chatMessages.removeChild(typingIndicator) // Remove typing indicator
      addMessage("ai", data.response)
    } catch (error) {
      console.error("Error:", error)
      chatMessages.removeChild(typingIndicator) // Remove typing indicator
      addMessage("ai", "Sorry, I could not get a response. Please try again.")
    }
  }

  sendButton.addEventListener("click", sendMessage)
  userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      sendMessage()
    }
  })

  // --- Dark Mode Toggle Functionality ---
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

  // --- FAQ Accordion Functionality ---
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
      if (isExpanded) {
        question.setAttribute("aria-expanded", "true")
        answer.style.display = "block"
      } else {
        question.setAttribute("aria-expanded", "false")
        answer.style.display = "none"
      }
    })
  })
})
