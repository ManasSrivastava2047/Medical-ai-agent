from flask import Flask, render_template, request
import os
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

os.environ["GOOGLE_API_KEY"] = "AIzaSyC9KE_S-mPkGrBskCGTmDBkMv-hz5HCxlM"

app = Flask(__name__)

llm = ChatGoogleGenerativeAI(model="models/gemini-1.5-flash-latest", temperature=0.2)

def get_symptom(state: dict) -> dict:
    state["symptom"] = state.get("symptom", "")
    return state

def classify_symptom(state: dict) -> dict:
    prompt = (
        "You are a helpful Medical Assistant. Classify the symptom below into:\n"
        "- General\n- Emergency\n- Mental health\n"
        f"Symptom: {state['symptom']}\n"
        "Respond only with one word: General, Emergency, or Mental Health.\n"
        "# Example: input: I have fever → Output: General"
    )
    response = llm.invoke([HumanMessage(content=prompt)])
    state["category"] = response.content.strip()
    return state

def symptom_router(state: dict) -> str:
    cat = state["category"].lower()
    if "general" in cat:
        return "general"
    elif "emergency" in cat:
        return "emergency"
    elif "mental" in cat:
        return "mental_health"
    else:
        return "general"

def general_node(state: dict) -> dict:
    state["answer"] = f"{state['symptom']} → Seems general. Directing you to the general ward."

    explain_prompt = (
        f"Explain the possible causes and medical relevance of the symptom: '{state['symptom']}' "
        f"in about 4-5 lines. Keep it concise and helpful for a general patient."
    )

    response = llm.invoke([HumanMessage(content=explain_prompt)])
    state["details"] = response.content.strip()
    return state

def emergency_node(state: dict) -> dict:
    state["answer"] = f"{state['symptom']} → It is a medical emergency! Seeking immediate help."

    explain_prompt = (
        f"The symptom '{state['symptom']}' may indicate an emergency. "
        f"Explain possible serious causes in 4–5 lines. Be specific but not alarming."
    )

    response = llm.invoke([HumanMessage(content=explain_prompt)])
    state["details"] = response.content.strip()
    return state

def mental_health_node(state: dict) -> dict:
    state["answer"] = f"{state['symptom']} → This may be a mental health issue. Please talk to our counselor."

    explain_prompt = (
        f"Explain in 4–5 lines what might be the causes or concerns behind the symptom: '{state['symptom']}' "
        f"from a mental health perspective. Keep the tone supportive and informative."
    )

    response = llm.invoke([HumanMessage(content=explain_prompt)])
    state["details"] = response.content.strip()
    return state



builder = StateGraph(dict)
builder.set_entry_point("get_symptom")
builder.add_node("get_symptom", get_symptom)
builder.add_node("classify", classify_symptom)
builder.add_node("general", general_node)
builder.add_node("emergency", emergency_node)
builder.add_node("mental_health", mental_health_node)

builder.add_edge("get_symptom", "classify")
builder.add_conditional_edges("classify", symptom_router, {
    "general": "general",
    "emergency": "emergency",
    "mental_health": "mental_health"
})

builder.add_edge("general", END)
builder.add_edge("emergency", END)
builder.add_edge("mental_health", END)

graph = builder.compile()

@app.route('/', methods=['GET', 'POST'])
def index():
    result = None
    details = None
    user_info = {}

    if request.method == 'POST':
        user_info['name'] = request.form['name']
        user_info['age'] = request.form['age']
        user_info['email'] = request.form['email']
        user_info['phone'] = request.form['phone']

        user_symptom = request.form['symptom']
        final_state = graph.invoke({"symptom": user_symptom})
        result = final_state.get("answer")
        details = final_state.get("details")

    return render_template('index.html', result=result, details=details, user_info=user_info)

if __name__ == '__main__':
    app.run(debug=True)
