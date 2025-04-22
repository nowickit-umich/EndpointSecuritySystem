from flask import Flask, jsonify, request
import pymysql
import re
import secrets
import os
app = Flask(__name__)

# In-memory user storage
users = {}

db_config = {
    "host": os.getenv('DB_HOST', 'database'),
    "user": os.getenv('DB_USER', 'user'),
    "password": os.getenv('DB_PASS', 'pass'),
    "database": os.getenv('DB_NAME', 'app_db')
}

@app.route("/test", methods=['GET'])
def test():
    return "{\"test\": \"This is a test!\"}"

@app.route("/dbtest", methods=['GET'])
def dbtest():
    connection = None
    try:
        connection = pymysql.connect(**db_config, cursorclass=pymysql.cursors.DictCursor)
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM alerts;")
            result = cursor.fetchall()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        if connection:
            connection.close()

@app.route("/register", methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    connection = None
    try:
        connection = pymysql.connect(**db_config, cursorclass=pymysql.cursors.DictCursor)
        with connection.cursor() as cursor:
            # Check if user exists
            cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
            if cursor.fetchone():
                return jsonify({"error": "Username already exists"}), 400
            
            # Insert new user
            cursor.execute("INSERT INTO users (username, passwordhash) VALUES (%s, %s)", (username, password))
            connection.commit()
            return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        if connection:
            connection.close()

@app.route("/login", methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    connection = None
    try:
        connection = pymysql.connect(**db_config, cursorclass=pymysql.cursors.DictCursor)
        with connection.cursor() as cursor:
            # Check if this is the first login (no users in database)
            cursor.execute("SELECT COUNT(*) as count FROM users")
            result = cursor.fetchone()
            is_first_login = result['count'] == 0

            # If first login, check default credentials
            if is_first_login:
                if username == "Admin" and password == "Admin":
                    print("First login with default credentials")  # Debug log
                    return jsonify({
                        "success": True,
                        "message": "Login successful",
                        "requiresCredentialChange": True
                    }), 200
                else:
                    print("First login with wrong credentials")  # Debug log
                    return jsonify({"error": "Invalid username or password"}), 401
            
            # Normal login flow
            cursor.execute("SELECT * FROM users WHERE username = %s AND passwordhash = %s", (username, password))
            user = cursor.fetchone()
            
            if not user:
                return jsonify({"error": "Invalid username or password"}), 401
            
            print("Successful login for existing user")  # Debug log
            return jsonify({
                "success": True,
                "message": "Login successful",
                "requiresCredentialChange": False
            }), 200
    except Exception as e:
        print(f"Login error: {str(e)}")  # Debug log
        return jsonify({"error": str(e)})
    finally:
        if connection:
            connection.close()

@app.route("/change-credentials", methods=['POST'])
def change_credentials():
    data = request.get_json()
    new_username = data.get('newUsername')
    new_password = data.get('newPassword')
    
    if not new_username or not new_password:
        return jsonify({"error": "New username and password are required"}), 400
    
    connection = None
    try:
        connection = pymysql.connect(**db_config, cursorclass=pymysql.cursors.DictCursor)
        with connection.cursor() as cursor:
            # Check if username already exists
            cursor.execute("SELECT * FROM users WHERE username = %s", (new_username,))
            if cursor.fetchone():
                return jsonify({"error": "Username already exists"}), 400
            
            # Delete any existing users
            cursor.execute("DELETE FROM users")
            
            # Insert new admin user
            cursor.execute("INSERT INTO users (username, passwordhash) VALUES (%s, %s)", 
                         (new_username, new_password))
            
            connection.commit()
            return jsonify({"message": "Credentials changed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        if connection:
            connection.close()

@app.route("/submit_logs", methods=['POST'])
def submit_logs():
    data = request.get_json()
    endpoint_id = data['id']

    #debug
    print("Endpoint: ", endpoint_id)

    for event in data['events']:
        for x in event:
            #debug
            print(x, event[x],  flush=True)

        #insert into database
        try:
            connection = pymysql.connect(**db_config, cursorclass=pymysql.cursors.DictCursor)
            with connection.cursor() as cursor:
                cursor.execute(f"INSERT INTO events (endpoint_id, event_time, message, event_type, pid) VALUES ( {endpoint_id}, {event['timestamp']}, 0, {event['type']}, {event['pid']} );")
                result = cursor.fetchall()
            return jsonify(result)
        except Exception as e:
            return jsonify({"error": str(e)}), 400
        finally:
            if connection:
                connection.close()
        return jsonify({"message": "Submit Log Successful"}), 200

@app.route("/create-endpoint", methods=['POST'])
def create_endpoint():
    data = request.get_json()
    endpoint_name = data.get('name')
    
    if not endpoint_name:
        return jsonify({"error": "Endpoint name is required"}), 400
    
    connection = None
    try:
        connection = pymysql.connect(**db_config, cursorclass=pymysql.cursors.DictCursor)
        with connection.cursor() as cursor:
            # Generate a unique endpoint ID
            cursor.execute("SELECT COALESCE(MAX(endpoint_id), 0) + 1 as new_id FROM endpoints")
            new_id = cursor.fetchone()['new_id']
            
            # Generate a random auth key
            auth_key = secrets.token_urlsafe(32)
            
            # Insert new endpoint with all required fields
            cursor.execute(
                "INSERT INTO endpoints (endpoint_id, authkey, hostname, ip_address, Name) VALUES (%s, %s, %s, %s, %s)",
                (new_id, auth_key, 'localhost', '127.0.0.1', endpoint_name)
            )
            connection.commit()
            
            # Generate config file content
            config_content = f"""# Endpoint Configuration File
api=http://localhost:5001/submit_logs
key={auth_key}
name={endpoint_name}
id={new_id}
buffer_size=65
batch_size=25
"""
            
            return jsonify({
                "success": True,
                "endpoint_id": new_id,
                "auth_key": auth_key,
                "config_content": config_content
            }), 201
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if connection:
            connection.close()

@app.route("/get-endpoints-count", methods=['GET'])
def get_endpoints_count():
    connection = None
    try:
        connection = pymysql.connect(**db_config, cursorclass=pymysql.cursors.DictCursor)
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) as count FROM endpoints")
            result = cursor.fetchone()
            return jsonify({"count": result['count']}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if connection:
            connection.close()
    