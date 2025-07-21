from flask import Flask, render_template, request
import os
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
if api_key is None:
    raise ValueError("GOOGLE_API_KEY is not set in the environment file.")

os.environ["GOOGLE_API_KEY"] = api_key

app = Flask(__name__)

llm = ChatGoogleGenerativeAI(model="models/gemini-1.5-flash-latest", temperature=0.2)

redirect_map = {
    "general": "general.html",
    "emergency": "emergency.html",
    "mentalhealth": "mental_health.html",
    "cardiology": "cardiology.html",
    "pulmonology": "pulmonology.html",
    "gastroenterology": "gastroenterology.html",
    "neurology": "neurology.html",
    "orthopedics": "orthopedics.html",
    "pediatrics": "pediatrics.html",
    "gynecology": "gynecology.html",
    "dermatology": "dermatology.html",
    "ent": "ent.html",
    "ophthalmology": "ophthalmology.html",
    "psychiatry": "psychiatry.html",
    "urology": "urology.html",
    "endocrinology": "endocrinology.html",
    "oncology": "oncology.html",
    "dental": "dental.html",
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

def symptom_router(state: dict) -> str:
    cat = state["category"].lower().replace(" ", "")
    return cat if cat in redirect_map else "general"

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
    result = None
    details = None
    redirect_url = "#"
    redirect_text = "Department"
    user_info = {}

    if request.method == 'POST':
        user_info['name'] = request.form['name']
        user_info['age'] = request.form['age']
        user_info['email'] = request.form['email']
        user_info['phone'] = request.form['phone']
        user_symptom = request.form['symptom']
        final_state = graph.invoke({"symptom": user_symptom})
        result = f"Classification: {final_state.get('answer')}"
        details = final_state.get("details")
        category = final_state.get("category", "general").lower().replace(" ", "")
        redirect_url = redirect_map.get(category, "general.html")
        redirect_text = category.replace("_", " ").title()

    return render_template('bookappt.html', result=result, details=details, user_info=user_info,
                           redirect_url=redirect_url, redirect_text=redirect_text)

if __name__ == '__main__':
    app.run(debug=True)
