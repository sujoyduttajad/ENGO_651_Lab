import os
from flask import Flask, render_template, request, redirect, session, jsonify
import mysql.connector
import bcrypt
from flask_session import Session

app = Flask(__name__)

# # Configure session to use filesystem --
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Function to get a new database connection for each request --
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user=os.getenv("DBUSERNAME", "root"),
        password=os.getenv("DBPASSWORD", "yourpassword"),  
        database="booksdb"
    )

@app.route("/")
def index():
    return "Project 1: TODO"

# BOOKS & USERS TABLE 
@app.route("/create_table")
def create_table():
    db = get_db_connection()
    cursor = db.cursor()

    # BOOKS table ---
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        author VARCHAR(255),
        isbn VARCHAR(20),
        year INT
    )
    """)

    # USERS table ---
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    )
    """)

    db.commit()
    cursor.close()
    db.close()
    
    return "Tables created successfully!"

if __name__ == "__main__":
    app.run(debug=True)

# REGISTER - USER AUTHENTICATION 
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        
        db = get_db_connection()
        cursor = db.cursor()
        
        # Hash the password before storing
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        try:
            cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_password))
            db.commit()
            return redirect("/login")
        except:
            return "Username already exists!"
        finally:
            cursor.close()
            db.close()

    return render_template("register.html")

# LOGIN - USER AUTHENTICATION 
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("SELECT id, password FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        cursor.close()
        db.close()
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user[1].encode('utf-8')):
            session["user_id"] = user[0]
            return redirect("/search")
        else:
            return "Invalid login!"
    
    return render_template("login.html")


# LOGOUT - USER AUTHENTICATION 
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")

# SEARCH PAGE 
@app.route("/search", methods=["GET"])
def search():
    if "user_id" not in session:
        return redirect("/login")

    query = request.args.get("q")
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM books WHERE isbn LIKE %s OR title LIKE %s OR author LIKE %s",
                   (f"%{query}%", f"%{query}%", f"%{query}%"))
    
    books = cursor.fetchall()
    cursor.close()
    db.close()

    return render_template("search.html", books=books)

# BOOK DETAILS PAGE 
@app.route("/book/<int:book_id>")
def book_page(book_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM books WHERE id = %s", (book_id,))
    book = cursor.fetchone()
    
    cursor.execute("SELECT reviews.review_text, reviews.rating, users.username FROM reviews JOIN users ON reviews.user_id = users.id WHERE book_id = %s",
                   (book_id,))
    reviews = cursor.fetchall()
    
    cursor.close()
    db.close()

    return render_template("book.html", book=book, reviews=reviews)

