import uuid
from database.db_manager import db_manager, SessionLocal
from database.models import InteractionModel

def test_interaction():
    session_id = "d2df1e3b-cfdb-462d-ad44-c396babe3603"
    print(f"Testing interaction storage for real session: {session_id}")
    try:
        result = db_manager.add_interaction(session_id, "What is Docker?", "Docker is a containerization platform.")
        if result:
            print(f"SUCCESS: Interaction stored with ID: {result.id}")
        else:
            print("FAILURE: Interaction not stored.")
    except Exception as e:
        import traceback
        print(f"CRITICAL ERROR: {str(e)}")
        traceback.print_exc()

if __name__ == "__main__":
    test_interaction()
