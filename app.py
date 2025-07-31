from flask import Flask, render_template, request, abort, jsonify
import os
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
  raise ValueError("GOOGLE_API_KEY is not set in the environment file.")

# Set Google API key for LangChain
os.environ["GOOGLE_API_KEY"] = api_key

# Initialize Flask app
app = Flask(__name__)

# Initialize Gemini LLM
llm = ChatGoogleGenerativeAI(model="models/gemini-1.5-flash-latest", temperature=0.2)

# Map for department slugs to be used in URLs and template names.
# The keys are derived from the AI classification (after lowercasing and removing spaces),
# and values are the base names of the HTML templates.
redirect_map = {
  "general": "generalmedicine", # Maps to generalmedicine.html
  "generalmedicine": "generalmedicine", # Ensure consistency
  "emergency": "emergency",
  "mentalhealth": "mental_health", # AI outputs "Mental health", becomes "mentalhealth" for key
  "psychiatry": "mental_health", # AI outputs "Psychiatry", maps to mental_health.html
  "cardiology": "cardiology",
  "pulmonology": "pulmonology",
  "gastroenterology": "gastroenterology",
  "neurology": "neurology",
  "orthopedics": "orthopedics",
  "pediatrics": "pediatrics",
  "gynecology": "gynecology",
  "dermatology": "dermatology",
  "ent": "ent",
  "ophthalmology": "ophthalmology",
  "urology": "urology",
  "endocrinology": "endocrinology",
  "oncology": "oncology",
  "dental": "dental", # Maps to dental.html
}

# System prompts for each department's AI assistant
# Add more as you create new department pages
DEPARTMENT_AI_PROMPTS = {
  "general-medicine": (
      "You are a helpful and knowledgeable AI assistant specializing in general medicine. "
      "Provide concise and accurate information related to common symptoms, general health advice, "
      "and typical treatments. Do not diagnose or prescribe medication. Always advise consulting "
      "a qualified medical professional for personalized advice. Keep your responses brief and to the point."
  ),
  "emergency": (
      "You are a helpful and knowledgeable AI assistant specializing in emergency medical situations. "
      "Provide concise and accurate information related to urgent symptoms, first aid advice, "
      "and when to seek immediate medical attention. Emphasize that this is not a substitute for professional "
      "medical help in an emergency. Do not diagnose or prescribe medication. Keep your responses brief and to the point."
  ),
  "cardiology": (
      "You are a helpful and knowledgeable AI assistant specializing in cardiology (heart health). "
      "Provide concise and accurate information related to heart conditions, symptoms, and general "
      "cardiovascular health advice. Do not diagnose or prescribe medication. Always advise consulting "
      "a qualified cardiologist for personalized advice. Keep your responses brief and to the point."
  ),
  "mental_health": (
      "You are a helpful and knowledgeable AI assistant specializing in mental health. "
      "Provide concise and accurate information related to common mental health conditions, coping strategies, "
      "and resources for support. Do not diagnose or prescribe medication. Always advise consulting "
      "a qualified mental health professional for personalized advice. Keep your responses brief and to the point."
  ),
  "dental": (
      "You are a helpful and knowledgeable AI assistant specializing in dental health. "
      "Provide concise and accurate information related to common dental issues, oral hygiene practices, "
      "and when to visit a dentist. Do not diagnose or prescribe medication. Always advise consulting "
      "a qualified dental professional for personalized advice. Keep your responses brief and to the point."
  ),
  # Add prompts for other departments here following the same pattern
}

# Step 1: Retrieve symptom
def get_symptom(state: dict) -> dict:
  state["symptom"] = state.get("symptom", "")
  return state

# Step 2: Classify into department
def classify_symptom(state: dict) -> dict:
  prompt = (
      "You are a helpful Medical Assistant. Classify the symptom below into one of these departments:\n"
      "- General, Emergency, Mental health, Cardiology, Pulmonology, Gastroenterology, Neurology, Orthopedics,\n"
      "Pediatrics, Gynecology, Dermatology, ENT, Ophthalmology, Psychiatry, Urology, Endocrinology, Oncology, Dental\n"
      f"\nSymptom: {state['symptom']}\n"
      "Respond only with the department name."
  )
  response = llm.invoke([HumanMessage(content=prompt)])
  state["category"] = response.content.strip()
  return state

# Step 3: Prepare display details
def detail_node(state: dict) -> dict:
  category = state["category"]
  # The redirect_key is used for CSS classes and for looking up in redirect_map
  redirect_key = category.lower().replace(" ", "")
  # The display_name is what's shown to the user, preserving spaces if they were in AI output
  display_name = category.replace("_", " ").title() # Use original category for display
  symptom = state["symptom"]
  state["answer"] = f"{symptom} → <span class='final-res-{redirect_key}'>{display_name}</span>"
  explain_prompt = (
      f"Explain the likely medical relevance of the symptom: '{symptom}' in 4–5 lines, based on {category} context."
  )
  response = llm.invoke([HumanMessage(content=explain_prompt)])
  state["details"] = response.content.strip()
  return state

# Define the state graph
builder = StateGraph(dict)
builder.set_entry_point("get_symptom")
builder.add_node("get_symptom", get_symptom)
builder.add_node("classify", classify_symptom)
builder.add_node("details", detail_node)
builder.add_edge("get_symptom", "classify")
builder.add_edge("classify", "details")
builder.add_edge("details", END)
graph = builder.compile()

# Routes
@app.route('/')
def index():
  return render_template('index.html')

@app.route('/book', methods=['GET', 'POST'])
def book():
  result = None
  details = None
  redirect_url = "#"
  department_name = "Recommended" # Changed from redirect_text to department_name for clarity
  user_info = {}
  if request.method == 'POST':
      user_info['name'] = request.form.get('name', '')
      user_info['age'] = request.form.get('age', '')
      user_info['email'] = request.form.get('email', '')
      user_info['phone'] = request.form.get('phone', '')
      user_symptom = request.form.get('symptom', '')
      selected_department = request.form.get('department_select', '') # Get selected department from dropdown

      if user_symptom:
          # If symptom is provided, use AI classification
          final_state = graph.invoke({"symptom": user_symptom})
          result = f"Classification: {final_state.get('answer')}"
          details = final_state.get("details")
          ai_category = final_state.get("category", "General")
          normalized_ai_category = ai_category.lower().replace(" ", "")
          department_name = normalized_ai_category # Use AI classified department for button
      elif selected_department:
          # If no symptom but department is selected, use the selected department
          department_name = selected_department
          result = f"You selected the {department_name.replace('_', ' ').title()} Department."
          details = "Please describe your symptoms for a detailed AI analysis, or proceed to the department page."
      else:
          # Fallback if neither symptom nor department is provided (should be prevented by JS validation)
          department_name = "general" # Default to general
          result = "Please describe your symptoms or select a department."
          details = ""

      # Determine the final department slug for redirection based on the determined department_name
      department_slug_for_redirect = redirect_map.get(department_name.lower().replace(" ", ""), 'generalmedicine')
      redirect_url = f"/departments/{department_slug_for_redirect}"

      # --- DEBUGGING START ---
      print(f"Flask: User Symptom: '{user_symptom}', Selected Department: '{selected_department}'")
      print(f"Flask: Final Department Name for JS: '{department_name}', Redirect URL: '{redirect_url}'")
      # --- DEBUGGING END ---
  return render_template('bookappt.html',
                          result=result,
                          details=details,
                          user_info=user_info,
                          redirect_url=redirect_url,
                          department_name=department_name) # Pass department_name to template

# Modified route to handle department pages
@app.route('/departments/<department_slug>')
def department_page(department_slug):
  try:
      # Attempt to render the specific department template by appending .html
      print(f"Attempting to render: templates/departments/{department_slug}.html")
      return render_template(f"departments/{department_slug}.html")
  except Exception as e:
      # If the specific department template is not found,
      # fall back to the general medicine page, similar to the JS handleRedirect's else block.
      print(f"Error rendering department template 'departments/{department_slug}.html': {e}. Falling back to general medicine.")
      return render_template("departments/generalmedicine.html")

# Dynamic API endpoint for AI chat for all departments
@app.route('/api/chat/<department_slug>', methods=['POST'])
def department_chat(department_slug):
  data = request.get_json()
  user_message = data.get('message')
  if not user_message:
      return jsonify({"error": "No message provided"}), 400
  # Get the appropriate system prompt based on the department_slug
  # Default to general-medicine prompt if not found
  system_prompt = DEPARTMENT_AI_PROMPTS.get(
      department_slug,
      DEPARTMENT_AI_PROMPTS["general-medicine"]
  )
  try:
      response = llm.invoke([
          SystemMessage(content=system_prompt),
          HumanMessage(content=user_message)
      ])
      ai_response = response.content.strip()
      return jsonify({"response": ai_response})
  except Exception as e:
      print(f"Error invoking LLM for {department_slug}: {e}")
      return jsonify({"error": "Failed to get AI response"}), 500

# Run the server
if __name__ == '__main__':
  app.run(debug=True)
