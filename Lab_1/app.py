from flask import Flask, request, jsonify
import mysql.connector
import os

app = Flask(__name__)

# Function to get a new database connection for each request
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user=os.getenv("DBUSERNAME"),
        password=os.getenv("DBPASSWORD"),
        database="booksdb"
    )

# @app.route("/")
# def home():
#     return "Flask + MySQL API is Running!"

@app.route("/")
def index():
    return "Project 1: TODO"

# ✅ Create table route (corrected)
@app.route("/create_table")
def create_table():
    db = get_db_connection()
    cursor = db.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        author VARCHAR(255),
        isbn VARCHAR(20),
        year INT
    )
    """)
    
    db.commit()
    cursor.close()
    db.close()
    
    return "Table created successfully!"

if __name__ == "__main__":
    app.run(debug=True)

