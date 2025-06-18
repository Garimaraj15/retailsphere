from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
import openai
import os
from db import get_db  # your existing DB connection utility

chatbot_bp = Blueprint('chatbot', __name__)

load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


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


@chatbot_bp.route('/chatbot/ask', methods=['POST'])
def ask_chatbot():
    data = request.get_json()
    message = data.get("message", "")

    if not message:
        return jsonify({"error": "Missing message"}), 400

    store_data = get_store_data()

    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a smart assistant for a store. Use only the following store data to answer questions. If unsure, say 'I don't know.'"
                },
                {
                    "role": "user",
                    "content": f"Store data:\n{store_data}\n\nQuestion: {message}"
                }
            ]
        )

        reply = completion.choices[0].message.content.strip()
        return jsonify({"response": reply})

    except Exception as e:
        print("[ERROR] Chatbot:", e)
        return jsonify({"error": str(e)}), 500
