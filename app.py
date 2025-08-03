from flask import Flask, render_template, request, abort, jsonify, session
import os
import mysql.connector
import bcrypt # For password hashing
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY is not set in the environment file.")
os.environ["GOOGLE_API_KEY"] = api_key

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "supersecretkey") # Needed for sessions

# MySQL Database Configuration
db_config = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", ""),
    "database": os.getenv("MYSQL_DATABASE", "apexcare_db"),
}

def get_db_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to MySQL: {err}")
        return None

llm = ChatGoogleGenerativeAI(model="models/gemini-1.5-flash-latest", temperature=0.2)

redirect_map = {
    "general": "generalmedicine",
    "generalmedicine": "generalmedicine",
    "emergency": "emergency",
    "mentalhealth": "mental_health",
    "psychiatry": "mental_health",  # Included here for AI classification mapping
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
    "dental": "dental",
}

DEPARTMENT_AI_PROMPTS = {
    "general-medicine": "...",
    "emergency": "...",
    "cardiology": "...",
    "mental_health": "...",
    "dental": "..."
}

def get_symptom(state: dict) -> dict:
    state["symptom"] = state.get("symptom", "")
    return state

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

def detail_node(state: dict) -> dict:
    category = state["category"]
    redirect_key = category.lower().replace(" ", "")
    display_name = category.replace("_", " ").title()
    symptom = state["symptom"]
    state["answer"] = f"{symptom} → <span class='final-res-{redirect_key}'>{display_name}</span>"
    explain_prompt = f"Explain the likely medical relevance of the symptom: '{symptom}' in 4–5 lines, based on {category} context."
    response = llm.invoke([HumanMessage(content=explain_prompt)])
    state["details"] = response.content.strip()
    return state

builder = StateGraph(dict)
builder.set_entry_point("get_symptom")
builder.add_node("get_symptom", get_symptom)
builder.add_node("classify", classify_symptom)
builder.add_node("details", detail_node)
builder.add_edge("get_symptom", "classify")
builder.add_edge("classify", "details")
builder.add_edge("details", END)
graph = builder.compile()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/book', methods=['GET', 'POST'])
def book():
    result, details, redirect_url = None, None, "#"
    department_name = "Recommended"
    user_info = session.get('user_info', {}) # Get user info from session if logged in

    if request.method == 'POST':
        user_symptom = request.form.get('symptom', '')
        selected_department = request.form.get('department_select', '')

        if user_symptom:
            final_state = graph.invoke({"symptom": user_symptom})
            result = f"Classification: {final_state.get('answer')}"
            details = final_state.get("details")
            ai_category = final_state.get('category', 'General')
            normalized_ai_category = ai_category.lower().replace(" ", "")
            department_name = normalized_ai_category
        elif selected_department:
            department_name = selected_department
            result = f"You selected the {department_name.replace('_', ' ').title()} Department."
            details = "Please describe your symptoms for a detailed AI analysis, or proceed to the department page."
        else:
            department_name = "general"
            result = "Please describe your symptoms or select a department."
            details = ""

        department_slug_for_redirect = redirect_map.get(department_name.lower().replace(" ", ""), 'generalmedicine')
        redirect_url = f"/departments/{department_slug_for_redirect}"

    return render_template('bookappt.html',
                           result=result,
                           details=details,
                           user_info=user_info, # Pass user_info from session
                           redirect_url=redirect_url,
                           department_name=department_name)

@app.route('/departments/<department_slug>')
def department_page(department_slug):
    try:
        return render_template(f"departments/{department_slug}.html")
    except Exception as e:
        return render_template("departments/generalmedicine.html")

@app.route('/api/chat/<department_slug>', methods=['POST'])
def department_chat(department_slug):
    data = request.get_json()
    user_message = data.get('message')
    if not user_message:
        return jsonify({"error": "No message provided"}), 400
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
        return jsonify({"error": "Failed to get AI response"}), 500

# --- New Authentication Routes ---
@app.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    age = data.get('age')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')

    if not all([name, age, email, phone, password]):
        return jsonify({"error": "All fields are required."}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed."}), 500

    cursor = conn.cursor()
    try:
        # Check if email or phone already exists
        cursor.execute("SELECT id FROM users WHERE email = %s OR phone = %s", (email, phone))
        if cursor.fetchone():
            return jsonify({"error": "Email or phone number already registered."}), 409

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        cursor.execute(
            "INSERT INTO users (name, age, email, phone, password_hash) VALUES (%s, %s, %s, %s, %s)",
            (name, age, email, phone, hashed_password)
        )
        conn.commit()
        return jsonify({"message": "Sign up successful! You can now log in."}), 201
    except mysql.connector.Error as err:
        conn.rollback()
        print(f"MySQL error during signup: {err}")
        return jsonify({"error": "Database error during signup."}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    phone = data.get('phone')
    password = data.get('password')

    if not all([phone, password]):
        return jsonify({"error": "Phone number and password are required."}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed."}), 500

    cursor = conn.cursor(dictionary=True) # Return rows as dictionaries
    try:
        cursor.execute("SELECT * FROM users WHERE phone = %s", (phone,))
        user = cursor.fetchone()

        if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({"error": "Invalid phone number or password."}), 401

        # Store user info in session (for demonstration, in a real app use more robust session management)
        session['user_info'] = {
            'id': user['id'],
            'name': user['name'],
            'age': user['age'],
            'email': user['email'],
            'phone': user['phone']
        }
        return jsonify({"message": "Login successful!", "user": session['user_info']}), 200
    except mysql.connector.Error as err:
        print(f"MySQL error during login: {err}")
        return jsonify({"error": "Database error during login."}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)
