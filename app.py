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
# The keys are derived from the AI classification, and values are the base names of the HTML templates.
redirect_map = {
    "general": "generalmedicine", # Maps to generalmedicine.html
    "emergency": "emergency",
    "mentalhealth": "mental_health",
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
    "psychiatry": "psychiatry",
    "urology": "urology",
    "endocrinology": "endocrinology",
    "oncology": "oncology",
    "dental": "dental",
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
    redirect_key = category.lower().replace(" ", "")
    display_name = category.replace("_", " ").title()
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
    redirect_text = "Department"
    user_info = {}

    if request.method == 'POST':
        user_info['name'] = request.form.get('name', '')
        user_info['age'] = request.form.get('age', '')
        user_info['email'] = request.form.get('email', '')
        user_info['phone'] = request.form.get('phone', '')
        user_symptom = request.form.get('symptom', '')

        final_state = graph.invoke({"symptom": user_symptom})
        result = f"Classification: {final_state.get('answer')}"
        details = final_state.get("details")

        category = final_state.get("category", "general").lower().replace(" ", "")
        # Get the department slug from the map, defaulting to 'generalmedicine'
        department_slug = redirect_map.get(category, 'generalmedicine')
        redirect_url = f"/departments/{department_slug}"
        redirect_text = category.replace("_", " ").title()

    return render_template('bookappt.html',
                           result=result,
                           details=details,
                           user_info=user_info,
                           redirect_url=redirect_url,
                           redirect_text=redirect_text)

# Modified route to handle department pages
@app.route('/departments/<department_slug>')
def department_page(department_slug):
    try:
        # Attempt to render the specific department template by appending .html
        return render_template(f"departments/{department_slug}.html")
    except Exception as e:
        # If the specific department template is not found,
        # fall back to the general medicine page, similar to the JS handleRedirect's else block.
        print(f"Error rendering department template '{department_slug}.html': {e}. Falling back to general medicine.")
        return render_template("departments/generalmedicine.html")

# New API endpoint for General Medicine AI chat
@app.route('/api/chat/general-medicine', methods=['POST'])
def general_medicine_chat():
    data = request.get_json()
    user_message = data.get('message')

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # System prompt to guide the AI's persona and knowledge
    system_prompt = (
        "You are a helpful and knowledgeable AI assistant specializing in general medicine. "
        "Provide concise and accurate information related to common symptoms, general health advice, "
        "and typical treatments. Do not diagnose or prescribe medication. Always advise consulting "
        "a qualified medical professional for personalized advice. Keep your responses brief and to the point."
    )

    try:
        # Invoke the LLM with the system message and user's message
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_message)
        ])
        ai_response = response.content.strip()
        return jsonify({"response": ai_response})
    except Exception as e:
        print(f"Error invoking LLM: {e}")
        return jsonify({"error": "Failed to get AI response"}), 500

# Run the server
if __name__ == '__main__':
    app.run(debug=True)
