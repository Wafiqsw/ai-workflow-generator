"""
CSV Upload Service
Handles CSV file upload, validation, and parsing
"""

import pandas as pd
import io
import json
import uuid
import os
from datetime import datetime
from typing import Dict, List, Any
from fastapi import UploadFile


class CSVService:
    """Service for handling CSV file operations"""
    
    # Maximum file size: 10MB
    MAX_FILE_SIZE = 10 * 1024 * 1024
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS = {'.csv', '.txt'}
    
    # Upload directory (will be mounted as volume)
    UPLOAD_DIR = "/app/uploads/csv"
    
    @staticmethod
    def validate_file(file: UploadFile) -> Dict[str, Any]:
        """
        Validate uploaded CSV file
        
        Args:
            file: Uploaded file object
            
        Returns:
            dict: Validation result with status and message
        """
        # Check file extension
        filename = file.filename or ""
        file_ext = filename[filename.rfind('.'):].lower() if '.' in filename else ''
        
        if file_ext not in CSVService.ALLOWED_EXTENSIONS:
            return {
                "valid": False,
                "error": f"Invalid file type. Allowed: {', '.join(CSVService.ALLOWED_EXTENSIONS)}"
            }
        
        return {"valid": True}
    
    @staticmethod
    async def save_uploaded_file(file: UploadFile) -> Dict[str, Any]:
        """
        Save uploaded file to persistent storage
        
        Args:
            file: Uploaded file object
            
        Returns:
            dict: Save result with file path
        """
        try:
            # Create upload directory if not exists
            os.makedirs(CSVService.UPLOAD_DIR, exist_ok=True)
            
            # Generate unique filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            original_filename = file.filename or "upload.csv"
            file_ext = original_filename[original_filename.rfind('.'):]
            unique_filename = f"{timestamp}_{uuid.uuid4().hex[:8]}{file_ext}"
            
            # Full file path
            file_path = os.path.join(CSVService.UPLOAD_DIR, unique_filename)
            
            # Save file
            contents = await file.read()
            with open(file_path, 'wb') as f:
                f.write(contents)
            
            # Reset file pointer for further processing
            await file.seek(0)
            
            return {
                "success": True,
                "file_path": file_path,
                "filename": unique_filename,
                "original_filename": original_filename,
                "size_bytes": len(contents)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to save file: {str(e)}"
            }
    
    @staticmethod
    async def parse_csv(file: UploadFile) -> Dict[str, Any]:
        """
        Parse CSV file and return data
        
        Args:
            file: Uploaded CSV file
            
        Returns:
            dict: Parsed data with rows, columns, and preview
        """
        try:
            # Read file content
            contents = await file.read()
            
            # Check file size
            if len(contents) > CSVService.MAX_FILE_SIZE:
                return {
                    "success": False,
                    "error": f"File too large. Maximum size: {CSVService.MAX_FILE_SIZE / (1024*1024)}MB"
                }
            
            # Parse CSV using pandas
            df = pd.read_csv(io.BytesIO(contents))
            
            # Get basic info
            row_count = len(df)
            columns = df.columns.tolist()
            
            # Get preview (first 5 rows)
            preview = df.head(5).to_dict('records')
            
            # Get data types
            dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}
            
            return {
                "success": True,
                "data": {
                    "filename": file.filename,
                    "row_count": row_count,
                    "column_count": len(columns),
                    "columns": columns,
                    "dtypes": dtypes,
                    "preview": preview,
                    "full_data": df.to_dict('records')  # All rows
                }
            }
            
        except pd.errors.EmptyDataError:
            return {
                "success": False,
                "error": "CSV file is empty"
            }
        except pd.errors.ParserError as e:
            return {
                "success": False,
                "error": f"Failed to parse CSV: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error processing file: {str(e)}"
            }
        finally:
            # Reset file pointer
            await file.seek(0)
    
    @staticmethod
    def transform_to_api_list(csv_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Transform CSV data into api_list table format
        
        Expected CSV columns:
        - system_name (required)
        - api_name (required)
        - description (optional)
        - Other columns will be treated as params or returns based on naming
        
        Args:
            csv_data: List of dictionaries from parsed CSV
            
        Returns:
            dict: Transformed data ready for api_list table
        """
        try:
            transformed_records = []
            
            for row in csv_data:
                # Generate UUID for id unless already provided and valid
                record_id = str(uuid.uuid4())
                
                # Extract main fields
                system_name = row.get('system_name', row.get('System Name', ''))
                api_name = row.get('api_name', row.get('API Name', ''))
                description = row.get('description', row.get('Description', ''))
                
                # Intelligent param/return detection
                params_dict = {}
                returns_dict = {}
                
                # Special cases: If the CSV already has 'params_values' or 'return_values' columns
                # We try to parse them if they are strings, or use them directly if already dict/list
                for field_key in ['params_values', 'return_values']:
                    if field_key in row:
                        val = row[field_key]
                        if pd.isna(val):
                            val = None
                        elif isinstance(val, str) and (val.startswith('{') or val.startswith('[')):
                            try:
                                val = json.loads(val)
                            except:
                                pass # Keep as string if parsing fails
                        
                        if field_key == 'params_values':
                            params_dict = val if isinstance(val, (dict, list)) else {"value": val}
                        else:
                            returns_dict = val if isinstance(val, (dict, list)) else {"value": val}

                # If we don't have structured data, look for prefixed columns or other extra columns
                if not params_dict or not returns_dict:
                    for key, value in row.items():
                        key_lower = key.lower()
                        
                        # Skip already handled or meta fields
                        if key_lower in ['system_name', 'api_name', 'description', 'params_values', 'return_values', 'id', 'created_at']:
                            continue
                        
                        if pd.isna(value):
                            value = None
                        
                        if key_lower.startswith('param_') or key_lower.startswith('params_'):
                            name = key.replace('param_', '').replace('params_', '')
                            if not params_dict: params_dict = {} # Initialize if needed
                            if isinstance(params_dict, dict): params_dict[name] = value
                        elif key_lower.startswith('return_') or key_lower.startswith('returns_'):
                            name = key.replace('return_', '').replace('returns_', '')
                            if not returns_dict: returns_dict = {} # Initialize if needed
                            if isinstance(returns_dict, dict): returns_dict[name] = value
                        elif not params_dict: # If still nothing, put unknown columns into params
                            if not params_dict: params_dict = {}
                            if isinstance(params_dict, dict): params_dict[key] = value
                
                # Create transformed record
                transformed_record = {
                    "id": record_id,
                    "system_name": system_name,
                    "api_name": api_name,
                    "params_values": params_dict,
                    "return_values": returns_dict,
                    "description": description
                }
                
                transformed_records.append(transformed_record)
            
            return {
                "success": True,
                "transformed_count": len(transformed_records),
                "data": transformed_records
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Transformation error: {str(e)}"
            }

    @staticmethod
    def prepare_api_texts(records: List[Dict[str, Any]]) -> List[str]:
        """
        Prepare text strings from api_list records for embedding
        Format: "System: {system} | API: {api} | Description: {desc}"
        
        Args:
            records: List of transformed api_list records
            
        Returns:
            List of strings ready for embedding
        """
        texts = []
        for rec in records:
            system = rec.get("system_name", "Unknown System")
            api = rec.get("api_name", "Unknown API")
            desc = rec.get("description", "")
            
            text = f"System: {system} | API: {api}"
            if desc:
                text += f" | Description: {desc}"
            
            texts.append(text)
        return texts

