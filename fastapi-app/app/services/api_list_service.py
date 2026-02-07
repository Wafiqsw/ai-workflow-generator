from typing import List, Dict, Any, Optional
import json
import sqlalchemy as sa
from app.db.mysql import SessionLocal

def upsert_api_records(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Insert or Update multiple API records (Upsert)
    """
    try:
        with SessionLocal() as session:
            saved_count = 0
            for rec in records:
                # Convert dicts to JSON strings for MySQL
                params_json = json.dumps(rec.get("params_values", {}))
                returns_json = json.dumps(rec.get("return_values", {}))
                
                sql = sa.text("""
                    INSERT INTO api_list (id, system_name, api_name, params_values, return_values, description)
                    VALUES (:id, :system, :api, :params, :returns, :desc)
                    ON DUPLICATE KEY UPDATE 
                        system_name = VALUES(system_name),
                        api_name = VALUES(api_name),
                        params_values = VALUES(params_values),
                        return_values = VALUES(return_values),
                        description = VALUES(description)
                """)
                
                session.execute(sql, {
                    "id": rec["id"],
                    "system": rec["system_name"],
                    "api": rec["api_name"],
                    "params": params_json,
                    "returns": returns_json,
                    "desc": rec.get("description", "")
                })
                saved_count += 1
            
            session.commit()
            return {"success": True, "count": saved_count}
            
    except Exception as e:
        return {"success": False, "error": f"MySQL Upsert error: {str(e)}"}

def get_all_apis() -> List[Dict[str, Any]]:
    """
    Fetch all API records from database
    """
    try:
        with SessionLocal() as session:
            sql = sa.text("SELECT * FROM api_list ORDER BY created_at DESC")
            result = session.execute(sql)
            
            apis = []
            for row in result:
                api_dict = dict(row._mapping)
                if isinstance(api_dict.get("params_values"), str):
                    try:
                        api_dict["params_values"] = json.loads(api_dict["params_values"])
                    except: pass
                if isinstance(api_dict.get("return_values"), str):
                    try:
                        api_dict["return_values"] = json.loads(api_dict["return_values"])
                    except: pass
                apis.append(api_dict)
            
            return apis
    except Exception as e:
        print(f"Error fetching APIs: {e}")
        return []

def delete_api_record(api_id: str) -> bool:
    """
    Delete an API record by ID
    """
    try:
        with SessionLocal() as session:
            sql = sa.text("DELETE FROM api_list WHERE id = :id")
            session.execute(sql, {"id": api_id})
            session.commit()
            return True
    except Exception as e:
        print(f"Error deleting API: {e}")
        return False
