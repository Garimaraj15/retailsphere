from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
import os
import requests
from db import get_db  # Your existing DB connection utility

chatbot_bp = Blueprint('chatbot', __name__)

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


def get_store_data():
    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT name, description, price FROM products")
    products = cursor.fetchall()

    if not products:
        return "No products found."

    return "\n".join(
        [f"{name} - {desc} - ₹{price}" for name, desc, price in products]
    )


def ask_groq_chat(message, store_data):
    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "llama3-8b-8192",  # or "mixtral-8x7b-32768" if preferred
            "messages": [
                {
                    "role": "system",
                    "content": "You are a smart assistant for a store. Use only the following store data to answer questions. If unsure, say 'I don't know.'"
                },
                {
                    "role": "user",
                    "content": f"Store data:\n{store_data}\n\nQuestion: {message}"
                }
            ]
        }

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload
        )

        # Raise error if status is not 2XX
        response.raise_for_status()

        data = response.json()
        print("[DEBUG] Groq API success:", data)
        return {"success": True, "reply": data['choices'][0]['message']['content'].strip()}

    except requests.exceptions.HTTPError as http_err:
        print("[HTTP ERROR]", http_err)
        print("[RESPONSE TEXT]", response.text)
        return {"success": False, "error": response.text}

    except Exception as e:
        print("[ERROR] Groq API:", e)
        return {"success": False, "error": str(e)}


@chatbot_bp.route('/chatbot/ask', methods=['POST'])
def ask_chatbot():
    data = request.get_json()
    message = data.get("message", "")

    if not message:
        return jsonify({"error": "Missing message"}), 400

    store_data = get_store_data()
    result = ask_groq_chat(message, store_data)

    if result["success"]:
        return jsonify({"response": result["reply"]})
    else:
        return jsonify({"error": result["error"]}), 500
