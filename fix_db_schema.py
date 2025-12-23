import pymysql
import sys

# Database configuration
config = {
    'host': 'localhost',
    'port': 3308,
    'user': 'root',
    'password': '123456',
    'database': 'edushareqa',
    'cursorclass': pymysql.cursors.DictCursor
}

def fix_schema():
    connection = None
    try:
        print("Connecting to database...")
        connection = pymysql.connect(**config)
        
        with connection.cursor() as cursor:
            # Check if columns exist
            print("Checking 'users' table columns...")
            cursor.execute("DESCRIBE users")
            columns = [row['Field'] for row in cursor.fetchall()]
            print(f"Existing columns: {columns}")
            
            # Check roles
            print("Checking 'roles' table...")
            cursor.execute("SELECT * FROM roles")
            roles = cursor.fetchall()
            print(f"Roles: {roles}")
            
            # Add 'title' column if missing
            if 'title' not in columns:
                print("Adding 'title' column...")
                cursor.execute("ALTER TABLE users ADD COLUMN title VARCHAR(64) DEFAULT NULL COMMENT '职称'")
                print("'title' column added.")
            else:
                print("'title' column already exists.")
                
            # Add 'bio' column if missing
            if 'bio' not in columns:
                print("Adding 'bio' column...")
                cursor.execute("ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL COMMENT '简介'")
                print("'bio' column added.")
            else:
                print("'bio' column already exists.")
        
        connection.commit()
        print("Schema update completed successfully.")
        
    except Exception as e:
        print(f"Error: {e}")
        if connection:
            connection.rollback()
        sys.exit(1)
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    fix_schema()
