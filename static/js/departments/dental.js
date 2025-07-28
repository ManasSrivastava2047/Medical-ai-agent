// Enhanced Dental Department JavaScript
class DentalDepartment {
  constructor() {
    this.chatMessages = []
    this.isTyping = false
    this.currentFilter = "all"
    this.doctorQueues = {
      wait1: 2,
      wait2: 1,
      wait3: 0,
    }
    this.queueTimers = {}
    this.reminders = []
    this.hygieneScore = 0
    this.currentPainLevel = null
    this.hasJoinedAnyQueue = false
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.initializeChat()
    this.initializeDarkMode()
    this.showEmergencyBanner()
    this.updateTimestamps()
    this.startQueueSimulation()
    this.requestNotificationPermission()
  }

  requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }

  setupEventListeners() {
    // Chat functionality
    const sendButton = document.getElementById("send-button")
    const userInput = document.getElementById("user-input")

    if (sendButton) {
      sendButton.addEventListener("click", () => this.sendMessage())
    }

    if (userInput) {
      userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.sendMessage()
        }
      })

      userInput.addEventListener("input", () => {
        this.handleTyping()
      })
    }

    // Service filtering
    const filterButtons = document.querySelectorAll(".filter-btn")
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const filter = e.target.textContent.toLowerCase().replace(" services", "")
        this.filterServices(filter)
      })
    })

    // Service item clicks
    const serviceItems = document.querySelectorAll(".service-item")
    serviceItems.forEach((item) => {
      item.addEventListener("click", () => {
        this.selectService(item)
      })
    })

    // Scroll to top on page load
    window.addEventListener("load", () => {
      window.scrollTo(0, 0)
    })
  }

  initializeChat() {
    const initialMessage = {
      text: "Hello! I'm your Dental AI Assistant. I can help you with dental concerns, appointment scheduling, and provide oral health tips. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    }

    this.addMessageToChat(initialMessage)
    this.updateInitialTimestamp()
  }

  updateInitialTimestamp() {
    const initialTimeElement = document.getElementById("initial-time")
    if (initialTimeElement) {
      initialTimeElement.textContent = this.formatTime(new Date())
    }
  }

  showEmergencyBanner() {
    // Show emergency banner randomly or based on certain conditions
    const shouldShow = Math.random() < 0.3 // 30% chance
    if (shouldShow) {
      const banner = document.getElementById("emergency-banner")
      if (banner) {
        banner.style.display = "block"
        setTimeout(() => {
          if (banner.style.display !== "none") {
            this.closeEmergencyBanner()
          }
        }, 10000) // Auto-close after 10 seconds
      }
    }
  }

  closeEmergencyBanner() {
    const banner = document.getElementById("emergency-banner")
    if (banner) {
      banner.style.animation = "slideUp 0.3s ease-out reverse"
      setTimeout(() => {
        banner.style.display = "none"
      }, 300)
    }
  }

  filterServices(filter) {
    this.currentFilter = filter
    const serviceItems = document.querySelectorAll(".service-item")
    const filterButtons = document.querySelectorAll(".filter-btn")

    // Update active button
    filterButtons.forEach((btn) => {
      btn.classList.remove("active")
      if (btn.textContent.toLowerCase().includes(filter) || filter === "all") {
        btn.classList.add("active")
      }
    })

    // Filter services
    serviceItems.forEach((item) => {
      const category = item.dataset.category
      if (filter === "all" || category === filter) {
        item.style.display = "flex"
        item.classList.add("fade-in")
      } else {
        item.style.display = "none"
      }
    })
  }

  selectService(serviceItem) {
    // Remove previous selections
    document.querySelectorAll(".service-item").forEach((item) => {
      item.classList.remove("selected")
    })

    // Add selection to clicked item
    serviceItem.classList.add("selected")

    // Get service name and send to chat
    const serviceName = serviceItem.querySelector(".service-name").textContent
    const urgency = serviceItem.dataset.urgency

    this.sendQuickMessage(`I need help with: ${serviceName}`)

    document.querySelector(".ai-chat-section").scrollIntoView({
      behavior: "smooth",
    })
  }

  // Dark mode functionality
  toggleDarkMode() {
    const body = document.body
    const icon = document.getElementById("dark-mode-icon")

    if (body.getAttribute("data-theme") === "dark") {
      body.removeAttribute("data-theme")
      icon.className = "fas fa-moon"
      localStorage.setItem("theme", "light")
    } else {
      body.setAttribute("data-theme", "dark")
      icon.className = "fas fa-sun"
      localStorage.setItem("theme", "dark")
    }
  }

  // Initialize dark mode from localStorage
  initializeDarkMode() {
    const savedTheme = localStorage.getItem("theme")
    const body = document.body
    const icon = document.getElementById("dark-mode-icon")

    if (savedTheme === "dark") {
      body.setAttribute("data-theme", "dark")
      if (icon) icon.className = "fas fa-sun"
    }
  }

  // Pain level assessment
  selectPainLevel(level) {
    this.currentPainLevel = level

    // Update button states
    document.querySelectorAll(".pain-btn").forEach((btn) => {
      btn.classList.remove("selected")
    })
    document.querySelector(`[data-level="${level}"]`).classList.add("selected")

    // Show result
    const resultDiv = document.getElementById("pain-result")
    let message = ""
    let bgColor = ""

    if (level === 0) {
      message = "✅ Great! No pain means healthy teeth. Keep up your oral hygiene routine!"
      bgColor = "#d4edda"
    } else if (level <= 3) {
      message = "⚠️ Mild discomfort. Monitor the area and consider a routine checkup."
      bgColor = "#fff3cd"
    } else if (level <= 6) {
      message = "🔶 Moderate pain requires attention. Schedule an appointment soon."
      bgColor = "#f8d7da"
    } else {
      message = "🚨 Severe pain needs immediate attention! Consider emergency care."
      bgColor = "#f5c6cb"
    }

    resultDiv.innerHTML = message
    resultDiv.style.backgroundColor = bgColor
    resultDiv.classList.add("show")
  }

  // Oral hygiene tracker
  updateHygieneTracker() {
    const checkboxes = ["brushed-morning", "brushed-evening", "flossed", "mouthwash"]
    let checkedCount = 0

    checkboxes.forEach((id) => {
      if (document.getElementById(id).checked) {
        checkedCount++
      }
    })

    this.hygieneScore = (checkedCount / checkboxes.length) * 100
    const scoreDiv = document.getElementById("hygiene-score")

    let message = ""
    let bgColor = ""

    if (this.hygieneScore === 100) {
      message = "🌟 Excellent! Perfect oral hygiene routine!"
      bgColor = "#d4edda"
    } else if (this.hygieneScore >= 75) {
      message = "👍 Good job! You're maintaining good oral health."
      bgColor = "#d1ecf1"
    } else if (this.hygieneScore >= 50) {
      message = "⚠️ Fair. Try to complete more daily oral care tasks."
      bgColor = "#fff3cd"
    } else {
      message = "❌ Poor. Your oral health needs more attention!"
      bgColor = "#f8d7da"
    }

    scoreDiv.innerHTML = `Daily Score: ${this.hygieneScore.toFixed(0)}% - ${message}`
    scoreDiv.style.backgroundColor = bgColor
    scoreDiv.style.padding = "1rem"
    scoreDiv.style.borderRadius = "8px"
  }

  // Appointment reminder system
  setReminder() {
    const appointmentTime = document.getElementById("appointment-time").value
    if (!appointmentTime) {
      alert("Please select a date and time for your reminder.")
      return
    }

    const reminderDate = new Date(appointmentTime)
    const now = new Date()

    if (reminderDate <= now) {
      alert("Please select a future date and time.")
      return
    }

    const reminder = {
      id: Date.now(),
      date: reminderDate,
      message: `Dental appointment reminder for ${reminderDate.toLocaleString()}`,
    }

    this.reminders.push(reminder)
    this.displayReminders()

    // Set actual browser notification
    const timeUntilReminder = reminderDate.getTime() - now.getTime()
    setTimeout(() => {
      this.showNotification(reminder.message)
    }, timeUntilReminder)

    document.getElementById("appointment-time").value = ""
  }

  displayReminders() {
    const container = document.getElementById("active-reminders")
    container.innerHTML = ""

    this.reminders.forEach((reminder) => {
      const reminderDiv = document.createElement("div")
      reminderDiv.className = "reminder-item"
      reminderDiv.innerHTML = `
        <span>${reminder.date.toLocaleString()}</span>
        <button onclick="window.dentalApp.removeReminder(${reminder.id})" style="background: none; border: none; color: #dc3545; cursor: pointer;">
          <i class="fas fa-times"></i>
        </button>
      `
      container.appendChild(reminderDiv)
    })
  }

  showNotification(message) {
    if (Notification.permission === "granted") {
      new Notification("Dental Appointment Reminder", {
        body: message,
        icon: "/placeholder.svg?height=64&width=64&text=🦷",
      })
    }
  }

  // Enhanced addToQueue with timer
  addToQueue(waitId, timeId, doctorName) {
    if (this.hasJoinedAnyQueue) {
      return // Prevent further action if a queue has already been joined
    }

    const waitElement = document.getElementById(waitId)
    const timeElement = document.getElementById(timeId)
    const button = document.querySelector(`button[onclick*="${waitId}"]`)
    const timerDisplay = document.getElementById(`timer-display-${waitId.slice(-1)}`)
    const timerElement = document.getElementById(`timer-${waitId.slice(-1)}`)

    if (waitElement && timeElement && button) {
      // Disable button and show timer
      button.disabled = true
      button.innerHTML = '<i class="fas fa-clock"></i> Processing...'
      timerDisplay.style.display = "block"

      let timeLeft = 1
      timerElement.textContent = timeLeft

      const countdown = setInterval(() => {
        timeLeft--
        timerElement.textContent = timeLeft

        if (timeLeft <= 0) {
          clearInterval(countdown)

          // Update queue
          let currentWait = Number.parseInt(waitElement.textContent)
          currentWait++
          waitElement.textContent = currentWait
          timeElement.textContent = currentWait * 15
          this.doctorQueues[waitId] = currentWait

          this.hasJoinedAnyQueue = true
          this.disableAllQueueButtons() // Call the new function to disable all buttons

          // Re-enable button
          button.disabled = false
          button.innerHTML = '<i class="fas fa-plus"></i> Join Queue'
          timerDisplay.style.display = "none"

          // Show success message
          //this.showQueueSuccess(doctorName)

          // Add confirmation to chat (non-booking related)
          const confirmationMessage = {
            text: `You've been added to ${doctorName}'s queue. Current waiting time: approximately ${currentWait * 15} minutes. Please arrive 15 minutes early for your appointment.`,
            isUser: false,
            timestamp: new Date(),
          }
          this.addMessageToChat(confirmationMessage)
        }
      }, 1000)

      this.queueTimers[waitId] = countdown
    }
  }

  disableAllQueueButtons() {
    const allQueueButtons = document.querySelectorAll(".wait-btn")
    allQueueButtons.forEach((button) => {
      button.disabled = true
      button.innerHTML = '<i class="fas fa-check-circle"></i> Queue Joined' // Or 'Unavailable'
      button.style.background = "linear-gradient(135deg, var(--color-success) 0%, #27ae60 100%)"
      button.style.boxShadow = "none"
    })
  }

  startQueueSimulation() {
    // Simulate queue changes every 2-5 minutes
    setInterval(
      () => {
        this.simulateQueueChanges()
      },
      Math.random() * 180000 + 120000,
    ) // 2-5 minutes
  }

  simulateQueueChanges() {
    const queueIds = ["wait1", "wait2", "wait3"]
    const randomQueue = queueIds[Math.floor(Math.random() * queueIds.length)]
    const waitElement = document.getElementById(randomQueue)
    const timeElement = document.getElementById(randomQueue.replace("wait", "time"))

    if (waitElement && timeElement) {
      let currentWait = Number.parseInt(waitElement.textContent)
      if (currentWait > 0 && Math.random() < 0.7) {
        // 70% chance to decrease queue
        currentWait--
        waitElement.textContent = currentWait
        timeElement.textContent = currentWait * 15
        this.doctorQueues[randomQueue] = currentWait
      }
    }
  }

  sendMessage() {
    const userInput = document.getElementById("user-input")
    const message = userInput.value.trim()

    if (!message || this.isTyping) return

    // Add user message
    const userMessage = {
      text: message,
      isUser: true,
      timestamp: new Date(),
    }

    this.addMessageToChat(userMessage)
    userInput.value = ""

    // Show typing indicator and generate response
    this.showTypingIndicator()

    setTimeout(
      () => {
        this.hideTypingIndicator()
        const aiResponse = this.generateAIResponse(message)
        const aiMessage = {
          text: aiResponse,
          isUser: false,
          timestamp: new Date(),
        }
        this.addMessageToChat(aiMessage)
      },
      1500 + Math.random() * 1000,
    ) // 1.5-2.5 seconds
  }

  sendQuickMessage(message) {
    const userMessage = {
      text: message,
      isUser: true,
      timestamp: new Date(),
    }

    this.addMessageToChat(userMessage)

    // Show typing indicator and generate response
    this.showTypingIndicator()

    setTimeout(
      () => {
        this.hideTypingIndicator()
        const aiResponse = this.generateAIResponse(message)
        const aiMessage = {
          text: aiResponse,
          isUser: false,
          timestamp: new Date(),
        }
        this.addMessageToChat(aiMessage)
      },
      1000 + Math.random() * 500,
    )
  }

  generateAIResponse(input) {
    const lowerInput = input.toLowerCase()

    // Emergency responses
    if (lowerInput.includes("emergency") || lowerInput.includes("urgent") || lowerInput.includes("severe pain")) {
      return "🚨 This sounds like a dental emergency! Please call our emergency line immediately at (555) 123-4567 or visit our emergency department. If you're experiencing severe pain, swelling, or trauma, don't wait - seek immediate care."
    }

    // Redirect appointment requests to queue system
    if (lowerInput.includes("appointment") || lowerInput.includes("book") || lowerInput.includes("schedule")) {
      return "For appointments, please use the 'Join Queue' buttons next to our doctors above. I can help you with dental questions, oral health tips, and general information about our services. What would you like to know about dental care?"
    }

    // Pain-related responses with tool reference
    if (
      lowerInput.includes("pain") ||
      lowerInput.includes("hurt") ||
      lowerInput.includes("ache") ||
      lowerInput.includes("toothache")
    ) {
      return "I understand you're experiencing dental pain. You can use our Pain Level Assessment tool above to evaluate your pain level. For immediate evaluation, please join Dr. Alex Turner's queue using the button next to his profile. In the meantime, you can rinse with warm salt water and take over-the-counter pain medication as directed."
    }

    // Oral hygiene advice with tracker reference
    if (lowerInput.includes("hygiene") || lowerInput.includes("brushing") || lowerInput.includes("flossing")) {
      return "Great question about oral hygiene! Try our Daily Oral Care Tracker above to monitor your routine. Here are the essentials: brush twice daily with fluoride toothpaste, floss daily, use mouthwash, and maintain regular dental checkups. What specific aspect of oral care would you like to know more about?"
    }

    // General dental education responses
    if (lowerInput.includes("cavity") || lowerInput.includes("cavities")) {
      return "Cavities are permanently damaged areas in teeth that develop into tiny holes. They're caused by bacteria, frequent snacking, sugary drinks, and poor oral hygiene. Prevention includes regular brushing, flossing, using fluoride, and avoiding frequent snacking. Early treatment is important to prevent complications."
    }

    if (lowerInput.includes("gum") || lowerInput.includes("bleeding") || lowerInput.includes("gingivitis")) {
      return "Gum health is crucial! Bleeding gums often indicate gingivitis - inflammation caused by plaque buildup. Signs include red, swollen, or tender gums. Prevention: brush gently twice daily, floss regularly, use antimicrobial mouthwash, and get regular cleanings. If bleeding persists, please join a doctor's queue for evaluation."
    }

    if (lowerInput.includes("whitening") || lowerInput.includes("white teeth")) {
      return "Teeth whitening can be done professionally or at home. Professional treatments are safer and more effective. Natural methods include avoiding staining foods (coffee, wine, tobacco), brushing after meals, and using whitening toothpaste. For professional whitening options, consult with our dentists."
    }

    if (lowerInput.includes("wisdom teeth") || lowerInput.includes("wisdom tooth")) {
      return "Wisdom teeth typically emerge between ages 17-25. Not everyone needs them removed. Extraction may be needed if there's insufficient space, impaction, decay, or gum disease. Signs of problems include pain, swelling, difficulty opening mouth, or bad breath. Dr. Chris Brown specializes in wisdom tooth extractions."
    }

    // Default educational response
    const responses = [
      "I'm here to help with dental health questions and provide oral care information. For appointments, please use the queue system above. What would you like to know about dental care?",
      "I can provide information about oral health, dental procedures, and preventive care. Use our dental tools above for pain assessment and hygiene tracking. What dental topic interests you?",
      "Feel free to ask about dental symptoms, oral hygiene tips, or treatment information. For scheduling appointments, please join the appropriate doctor's queue above. How can I help with your dental questions?",
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  addMessageToChat(message) {
    const chatMessages = document.getElementById("chat-messages")
    if (!chatMessages) return

    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${message.isUser ? "user-message" : "ai-message"}`

    const avatarDiv = document.createElement("div")
    avatarDiv.className = "message-avatar"
    avatarDiv.innerHTML = message.isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>'

    const contentDiv = document.createElement("div")
    contentDiv.className = "message-content"

    const textP = document.createElement("p")
    textP.textContent = message.text

    const timeSpan = document.createElement("span")
    timeSpan.className = "message-time"
    timeSpan.textContent = this.formatTime(message.timestamp)

    contentDiv.appendChild(textP)
    contentDiv.appendChild(timeSpan)
    messageDiv.appendChild(avatarDiv)
    messageDiv.appendChild(contentDiv)

    chatMessages.appendChild(messageDiv)

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight

    // Store message
    this.chatMessages.push(message)
  }

  showTypingIndicator() {
    if (this.isTyping) return

    this.isTyping = true
    const chatMessages = document.getElementById("chat-messages")
    if (!chatMessages) return

    const typingDiv = document.createElement("div")
    typingDiv.className = "message ai-message"
    typingDiv.id = "typing-indicator"

    const avatarDiv = document.createElement("div")
    avatarDiv.className = "message-avatar"
    avatarDiv.innerHTML = '<i class="fas fa-robot"></i>'

    const contentDiv = document.createElement("div")
    contentDiv.className = "typing-indicator"
    contentDiv.innerHTML = `
      <span>AI is typing</span>
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `

    typingDiv.appendChild(avatarDiv)
    typingDiv.appendChild(contentDiv)
    chatMessages.appendChild(typingDiv)

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  hideTypingIndicator() {
    this.isTyping = false
    const typingIndicator = document.getElementById("typing-indicator")
    if (typingIndicator) {
      typingIndicator.remove()
    }
  }

  handleTyping() {
    const sendButton = document.getElementById("send-button")
    const userInput = document.getElementById("user-input")

    if (sendButton && userInput) {
      sendButton.disabled = !userInput.value.trim() || this.isTyping
    }
  }

  formatTime(date) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  updateTimestamps() {
    // Update timestamps every minute
    setInterval(() => {
      const timeElements = document.querySelectorAll(".message-time")
      timeElements.forEach((element, index) => {
        if (this.chatMessages[index]) {
          element.textContent = this.formatTime(this.chatMessages[index].timestamp)
        }
      })
    }, 60000)
  }
}

// Global functions for HTML onclick events
function toggleDarkMode() {
  if (window.dentalApp) {
    window.dentalApp.toggleDarkMode()
  }
}

function selectPainLevel(level) {
  if (window.dentalApp) {
    window.dentalApp.selectPainLevel(level)
  }
}

function updateHygieneTracker() {
  if (window.dentalApp) {
    window.dentalApp.updateHygieneTracker()
  }
}

function setReminder() {
  if (window.dentalApp) {
    window.dentalApp.setReminder()
  }
}

// Global functions for HTML onclick events
function addToQueue(waitId, timeId, doctorName) {
  if (window.dentalApp) {
    window.dentalApp.addToQueue(waitId, timeId, doctorName)
  }
}

function increment(waitId) {
  // Legacy function for backward compatibility
  const timeId = waitId.replace("wait", "time")
  const doctorNames = {
    wait1: "Dr. Alex Turner",
    wait2: "Dr. Maya Singh",
    wait3: "Dr. Chris Brown",
  }
  addToQueue(waitId, timeId, doctorNames[waitId])
}

function filterServices(filter) {
  if (window.dentalApp) {
    window.dentalApp.filterServices(filter)
  }
}

function sendQuickMessage(message) {
  if (window.dentalApp) {
    window.dentalApp.sendQuickMessage(message)
  }
}

function closeEmergencyBanner() {
  if (window.dentalApp) {
    window.dentalApp.closeEmergencyBanner()
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.dentalApp = new DentalDepartment()

  // Add CSS animations
  const style = document.createElement("style")
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .service-item.selected {
      background-color: #e6f7ff !important;
      border-color: var(--color-secondary) !important;
      transform: translateY(-2px);
      box-shadow: var(--shadow-medium);
    }
    
    .queue-success {
      animation: slideIn 0.3s ease-out;
    }
  `
  document.head.appendChild(style)
})

// Service Worker for offline functionality (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("ServiceWorker registration successful")
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed")
      })
  })
}

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = DentalDepartment
}
