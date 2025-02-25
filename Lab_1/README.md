# Lab 1 and Lab 2

ENGO 551 - Lab 2 Assignment video link - https://yuja.ucalgary.ca/V/Video?v=1166446&a=177710513 

### Name - SUJOY DUTTA
#### UCID - 30210488

For Lab 2 changes made - 
### ***Google Books API data fetched and updated into the book table***
### ***Google Gemini API utilized to generate summary with error handling***
### ***Added Reviews table, user can add one review per book***

# Flask Library Web Application

## ** BE ADVISED I USED MYSQL INSTEAD OF POSTGRES SINCE I RAN INTO MAJOR ISSUES WITH POSTGRES AUTHENTICATION I HAD TO SWITCH TO MYSQL ALTHOUGH THE OBJECTIVES OF THE ASSIGNMENT ARE FULLFILLED**

## Project Overview
This is a **Flask-based web application** that allows users to **search for books** and view their details. Users can also register and log in to access features. The project uses **MySQL** as the database and employs **Flask sessions** for user authentication.

---

##  Project Structure

```
📂 project-folder/
├── 📄 app.py              # Main Flask application
├── 📄 books.csv           # original books csv file
├── 📄 import.py           # Imports books from books.csv into MySQL
├── 📄 requirements.txt    # List of dependencies
├── 📄 README.md           # Project documentation
├── 📂 templates/          # HTML templates for frontend
│   ├── 📄 register.html   # User registration page
│   ├── 📄 login.html      # User login page
│   ├── 📄 search.html     # Search page
│   ├── 📄 book.html       # Book details page
```

---

##  Installation & Setup
### **Step 1: Install Python**
Ensure you have Python 3 installed. Check using:
```sh
python --version
```

### **Step 2: Install Dependencies**
Run the following command to install all required Python packages:
```sh
pip install -r requirements.txt
```

### **Step 3: Set Up MySQL Database**
1. Start MySQL:
   ```sh
   net start mysql  
   ```
2. Open MySQL:
   ```sh
   mysql -u root -p
   ```
3. Just run the app file:
   ```sh
   python app.py
   ```
   OR

   ```sh
   py .\app.py
   ```

   and visit `http://127.0.0.1:5000/create_table` to create tables.

### **Step 4: Import Book Data**
Run:
```sh
python import.py
```
This will import books from `books.csv` into the database.

### **Step 5: Run the Application**
Start the Flask server:
```sh
python app.py
```
Access the application at:
```
http://127.0.0.1:5000/
```

---


Run:
```sh
pip install -r requirements.txt
```
to install all dependencies.

---

##  Notes*
- Ensure MySQL is **running** before starting the app.
- If using environment variables for MySQL credentials, set them before running:
  ```sh
  set DBUSERNAME=root
  set DBPASSWORD=yourpassword
  ```


