from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from db import get_db  # Ensure you have this utility for DB connection

queue_bp = Blueprint('queue', __name__)

ESTIMATED_WAIT_PER_PERSON = 2  # minutes per person

# Join the queue
@queue_bp.route('/queue/join', methods=['POST'])
def join_queue():
    data = request.get_json()
    store = data.get("store_name")
    user = data.get("user_name")

    if not store or not user:
        return jsonify({"error": "Missing store or user"}), 400

    db = get_db()
    cursor = db.cursor()

    # Get current max token
    cursor.execute("SELECT MAX(token_number) FROM queues WHERE store_name = %s", (store,))
    max_token = cursor.fetchone()[0] or 0
    new_token = max_token + 1
    timestamp = datetime.now()

    cursor.execute("""
        INSERT INTO queues (store_name, user_name, token_number, timestamp)
        VALUES (%s, %s, %s, %s)
    """, (store, user, new_token, timestamp))
    db.commit()

    print(f"[JOIN] User '{user}' joined {store} queue with token #{new_token} at {timestamp}")
    return jsonify({"token_number": new_token})

# Get queue size
@queue_bp.route('/queue/status/<store_name>', methods=['GET'])
def get_queue_status(store_name):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT COUNT(*) FROM queues WHERE store_name = %s", (store_name,))
    size = cursor.fetchone()[0]

    print(f"[STATUS] Queue size at {store_name}: {size}")
    return jsonify({"store_name": store_name, "queue_size": size})

# Get token position + ETA
@queue_bp.route('/queue/status/<store_name>/<int:token>', methods=['GET'])
def get_token_status(store_name, token):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        SELECT token_number, user_name, timestamp FROM queues
        WHERE store_name = %s ORDER BY token_number
    """, (store_name,))
    queue = cursor.fetchall()

    for position, entry in enumerate(queue):
        if entry[0] == token:
            timestamp = entry[2]
            eta_minutes = position * ESTIMATED_WAIT_PER_PERSON
            eta_time = datetime.now() + timedelta(minutes=eta_minutes)

            print(f"[POSITION] Token #{token} at position {position} in {store_name}, ETA: {eta_minutes} min")
            return jsonify({
                "token": token,
                "position": position,
                "joined_at": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "estimated_wait": f"{eta_minutes} min",
                "estimated_time": eta_time.strftime("%H:%M:%S")
            })

    return jsonify({"error": "Token not found"}), 404

# Leave queue
@queue_bp.route('/queue/leave', methods=['POST'])
def leave_queue():
    data = request.get_json()
    store = data.get("store_name")
    token = data.get("token_number")

    if not store or token is None:
        return jsonify({"error": "Missing store or token"}), 400

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        DELETE FROM queues WHERE store_name = %s AND token_number = %s
    """, (store, token))
    db.commit()

    if cursor.rowcount > 0:
        print(f"[LEAVE] Token #{token} left the queue at {store}")
        return jsonify({"message": f"Token {token} removed from {store}"})
    else:
        return jsonify({"error": "Token not found"}), 404

# Clear queue
@queue_bp.route('/queue/clear/<store_name>', methods=['DELETE'])
def clear_queue(store_name):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("DELETE FROM queues WHERE store_name = %s", (store_name,))
    db.commit()

    print(f"[CLEAR] Queue at {store_name} cleared")
    return jsonify({"message": f"Queue at {store_name} cleared"})
