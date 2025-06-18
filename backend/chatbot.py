from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
import openai
import os
from db import get_db  # your existing DB connection utility

chatbot_bp = Blueprint('chatbot', __name__)

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")


def get_store_data(store_name):
    db = get_db()
    cursor = db.cursor()
    
    # Removed 'stock' from query
    cursor.execute("SELECT name, description, price FROM products WHERE store_name = %s", (store_name,))
    products = cursor.fetchall()

    if not products:
        return f"No products found for store '{store_name}'."

    # Format response without stock
    return "\n".join(
        [f"{name} - {desc} - ₹{price}" for name, desc, price in products]
    )


@chatbot_bp.route('/chatbot/ask', methods=['POST'])
def ask_chatbot():
    data = request.get_json()
    message = data.get("message", "")
    store = data.get("store_name", "")

    if not message or not store:
        return jsonify({"error": "Missing message or store_name"}), 400

    store_data = get_store_data(store)

    try:
        completion = openai.ChatCompletion.create(
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
        return jsonify({"error": "Something went wrong"}), 500
