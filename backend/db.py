import mysql.connector
import os

def get_db():
    # Read environment variables safely
    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT")
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    database = os.getenv("DB_NAME")

    # Validate presence of variables
    if not all([host, port, user, password, database]):
        raise Exception("Missing one or more database environment variables")

    # Convert port to integer
    try:
        port = int(port)
    except ValueError:
        raise Exception("DB_PORT must be an integer")

    # Establish and return a new connection
    return mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database
    )
