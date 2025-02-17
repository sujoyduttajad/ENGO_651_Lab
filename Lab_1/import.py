import csv
import mysql.connector
import os

# Create a new database connection for importing data from csv file
db = mysql.connector.connect(
    host="localhost",
    user="sujoyD",
    password="p1Q5&v7E%zSU1*f#L",  
    database="booksdb"
)

cursor = db.cursor()

# Run a function to read data from csv file to MySQL DB
with open("books.csv", newline="") as csvfile:
    reader = csv.reader(csvfile)
    next(reader)
    
    for isbn, title, author, year in reader:
        cursor.execute("INSERT INTO books (isbn, title, author, year) VALUES (%s, %s, %s, %s)",
                       (isbn, title, author, year))

db.commit()
cursor.close()
db.close()
print("Books imported successfully!")
