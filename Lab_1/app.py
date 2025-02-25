import os
from flask import Flask, render_template, request, redirect, session, jsonify, url_for
import mysql.connector
import bcrypt
from flask_session import Session
import requests

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

# GOOGLE API KEY
GOOGLE_BOOKS_API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")

# ---- FLASK FUNCTIONS ----

# HOME PAGE ROUTE
@app.route("/")
def index():
    # If the user is logged in → Redirects to /search
    if "user_id" in session:
        return redirect(url_for("search")) 
    # If the user is not logged in → Redirects to /login
    else:
        return redirect(url_for("login"))  

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

    # REVIEWS TABLE ---
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        book_id INT NOT NULL,
        review_text TEXT NOT NULL,
        rating INT CHECK (rating BETWEEN 1 AND 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, book_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )               
    """)

    db.commit()
    cursor.close()
    db.close()
    
    return "Tables created successfully!"

# REGISTER - USER AUTHENTICATION 
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
             
        
        # Hash password before storing
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        db = get_db_connection()
        cursor = db.cursor()
        
        try:
            cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_password))
            db.commit()
            return redirect(url_for("login"))
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
            return redirect(url_for("search"))
        else:
            return render_template("login.html", error="Invalid username or password")
    
    return render_template("login.html")


# LOGOUT - USER AUTHENTICATION 
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

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

    if not book:
        cursor.close()
        db.close()
        return "Book not found!", 404  

    cursor.execute("""
        SELECT reviews.review_text, reviews.rating, users.username 
        FROM reviews 
        JOIN users ON reviews.user_id = users.id 
        WHERE book_id = %s
    """, (book_id,))
    
    reviews = cursor.fetchall()

    # Google Books Reviews & Rating data
    book["google_data"] = fetch_google_books_data(book["isbn"])

    cursor.close()
    db.close()

    return render_template("book.html", book=book, reviews=reviews)



# REVIEWS SUBMIT REQUEST
@app.route("/book/<int:book_id>/review", methods=["POST"])
def add_review(book_id):
    if "user_id" not in session:
        return redirect(url_for("login"))

    user_id = session["user_id"]
    review_text = request.form["review_text"]
    rating = int(request.form["rating"])

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM reviews WHERE user_id = %s AND book_id = %s", (user_id, book_id))
    existing_review = cursor.fetchone()

    if existing_review:
        cursor.close()
        db.close()
        return "You have already reviewed this book!", 400

    cursor.execute("INSERT INTO reviews (user_id, book_id, review_text, rating) VALUES (%s, %s, %s, %s)",
                   (user_id, book_id, review_text, rating))
    db.commit()

    cursor.close()
    db.close()
    
    return redirect(url_for("book_page", book_id=book_id))

# Fetch Google Books Review Data
def fetch_google_books_data(isbn):
    url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}&key={GOOGLE_BOOKS_API_KEY}"
    response = requests.get(url)
    data = response.json()

    if "items" in data:
        book_info = data["items"][0]["volumeInfo"]
        return {
            "averageRating": book_info.get("averageRating", None),
            "ratingsCount": book_info.get("ratingsCount", None),
            "description": book_info.get("description", None)
        }
    return {"averageRating": None, "ratingsCount": None, "description": None}


if __name__ == "__main__":
    app.run(debug=True)