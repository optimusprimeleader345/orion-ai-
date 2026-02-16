from database.db_manager import engine
from sqlalchemy import inspect

def check_schema():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Tables in DB: {tables}")
    
    if 'interactions' in tables:
        columns = inspector.get_columns('interactions')
        print("Columns in 'interactions':")
        for col in columns:
            print(f" - {col['name']} ({col['type']})")
    else:
        print("CRITICAL: 'interactions' table is MISSING!")

if __name__ == "__main__":
    check_schema()
