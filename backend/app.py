from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from queue_routes import queue_bp
from db import get_db, close_db
import os

app = Flask(__name__)
CORS(app)
app.register_blueprint(queue_bp)

queues = {}  # In-memory store for queues

@app.teardown_appcontext
def teardown_db(exception):
    close_db()

@app.route('/queue')
def queue_page():
    return render_template('queue.html')

@app.route('/queue/status/<store_name>/<int:token>', methods=['GET'])
def get_token_status(store_name, token):
    store_queue = queues.get(store_name, [])
    if token in store_queue:
        position = store_queue.index(token)
        return jsonify({"position": position})
    else:
        return jsonify({"error": "Token not found"}), 404

@app.route('/dashboard/analytics')
def dashboard_analytics():
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # 1. Total products
        cursor.execute("SELECT COUNT(*) AS total_products FROM products")
        total_products = cursor.fetchone()['total_products']

        # 2. Feedback counts
        cursor.execute("""
            SELECT feedback_type, COUNT(*) AS count
            FROM product_feedback
            GROUP BY feedback_type
        """)
        feedback_data = cursor.fetchall()
        feedback_counts = {"like": 0, "neutral": 0, "dislike": 0}
        for row in feedback_data:
            feedback_counts[row['feedback_type']] = row['count']

        # 3. Total reports
        cursor.execute("SELECT COUNT(*) AS total_reports FROM product_reports")
        total_reports = cursor.fetchone()['total_reports']

        # 4. Most liked products
        cursor.execute("""
            SELECT p.id, p.name, COUNT(f.id) AS likes
            FROM products p
            JOIN product_feedback f ON p.id = f.product_id
            WHERE f.feedback_type = 'like'
            GROUP BY p.id, p.name
            ORDER BY likes DESC
            LIMIT 5
        """)
        top_liked_products = cursor.fetchall()

        return jsonify({
            "total_products": total_products,
            "feedback_counts": feedback_counts,
            "total_reports": total_reports,
            "top_liked_products": top_liked_products
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def home():
    return {"message": "RetailSphere Backend Running"}

@app.route('/test-db')
def test_db():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM products")
        count = cursor.fetchone()[0]
        return f"Total products: {count}"
    except Exception as e:
        return f"Error: {str(e)}"

@app.route('/product/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
        product = cursor.fetchone()
        if product:
            return jsonify(product)
        else:
            return jsonify({"error": "Product not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/product/<int:product_id>/feedback', methods=['POST'])
def submit_feedback(product_id):
    try:
        feedback_type = request.json.get('feedback_type')
        if feedback_type not in ['like', 'neutral', 'dislike']:
            return jsonify({"error": "Invalid feedback type"}), 400

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO product_feedback (product_id, feedback_type) VALUES (%s, %s)",
            (product_id, feedback_type)
        )
        conn.commit()
        return jsonify({"message": "Feedback submitted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/product/<int:product_id>/report', methods=['POST'])
def report_product(product_id):
    try:
        data = request.get_json()
        reason = data.get('report_reason')

        if not reason:
            return jsonify({"error": "Missing report reason"}), 400

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO product_reports (product_id, report_reason) VALUES (%s, %s)",
            (product_id, reason)
        )
        conn.commit()
        return jsonify({"message": "Report submitted successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/product/<int:product_id>/feedback-count', methods=['GET'])
def get_feedback_count(product_id):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT feedback_type, COUNT(*) as count 
            FROM product_feedback 
            WHERE product_id = %s 
            GROUP BY feedback_type
        """, (product_id,))
        rows = cursor.fetchall()

        counts = {"like": 0, "neutral": 0, "dislike": 0}
        for row in rows:
            counts[row['feedback_type']] = row['count']

        return jsonify(counts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
