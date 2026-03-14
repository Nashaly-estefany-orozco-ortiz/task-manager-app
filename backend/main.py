from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
import os

app = FastAPI()

# CORS para permitir conexión desde Angular
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# conexión a MySQL
def get_connection():
    connection = mysql.connector.connect(
        host=os.getenv("MYSQLHOST"),
        user=os.getenv("MYSQLUSER"),
        password=os.getenv("MYSQLPASSWORD"),
        database=os.getenv("MYSQLDATABASE"),
        port=os.getenv("MYSQLPORT")
    )
    return connection


@app.get("/")
def home():
    return {"message": "Task Manager API funcionando"}


# endpoint para obtener tareas
@app.get("/tasks")
def get_tasks():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM tasks")
    tasks = cursor.fetchall()

    cursor.close()
    conn.close()

    return tasks


# endpoint para crear tarea
@app.post("/tasks")
def create_task(title: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO tasks (title, completed) VALUES (%s,%s)",
        (title, False)
    )

    conn.commit()

    cursor.close()
    conn.close()

    return {"message": "Task creada"}