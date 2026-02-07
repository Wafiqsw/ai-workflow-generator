from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from app.services import CSVService, encode_text, JobService

router = APIRouter(prefix="/csv", tags=["CSV Upload"])


def background_csv_processor(job_id: str, file_content: bytes, filename: str):
    """
    Background task to process CSV: ETL -> Embedding -> Check Existence -> MySQL -> ChromaDB
    """
    import time
    try:
        from app.services import upsert_api_records, store_in_chroma, search_similar
        
        # 1. Start Stage 1 (Transform)
        JobService.update_job(job_id, status="processing", progress=2)
        time.sleep(0.3)

        import io
        import pandas as pd
        df = pd.read_csv(io.BytesIO(file_content))
        rows = df.to_dict('records')
        JobService.update_job(job_id, progress=15) # Mid-transform
        time.sleep(0.4)

        transform_result = CSVService.transform_to_api_list(rows)
        if not transform_result["success"]:
            JobService.update_job(job_id, status="error", error=transform_result["error"])
            return
            
        records = transform_result["data"]
        JobService.update_job(job_id, progress=30) # Stage 1 DONE
        time.sleep(0.8) # Show 100% on Bar 1

        # 2. Start Stage 2 (Embedding)
        JobService.update_job(job_id, progress=31)
        texts_to_embed = CSVService.prepare_api_texts(records)
        chunk_size = 50
        all_embeddings = []
        
        for i in range(0, len(texts_to_embed), chunk_size):
            chunk = texts_to_embed[i:i + chunk_size]
            chunk_embeddings = encode_text(chunk)
            all_embeddings.extend(chunk_embeddings)
            
            # Sub-progress within 30% -> 70%
            current_progress = 31 + int((i + len(chunk)) / len(texts_to_embed) * 38)
            JobService.update_job(job_id, progress=current_progress)

        JobService.update_job(job_id, progress=70) # Stage 2 DONE
        time.sleep(0.8) # Show 100% on Bar 2

        # 3. Start Stage 3 (Existence Scan)
        JobService.update_job(job_id, progress=71)
        
        final_to_save = []
        skipped_count = 0
        
        for i, record in enumerate(records):
            try:
                text_to_check = texts_to_embed[i]
                sim_results = search_similar(text_to_check, top_k=1)
                
                is_duplicate = False
                if sim_results and len(sim_results) > 0:
                    best_match = sim_results[0]
                    if best_match.get('score', 1.0) < 0.1: 
                        is_duplicate = True
                
                if is_duplicate:
                    skipped_count += 1
                else:
                    final_to_save.append({"record": record, "embedding": all_embeddings[i]})
                
                # Update sub-progress for larger files (71% -> 79%)
                # Only if file has many rows
                if len(records) > 10:
                    sub_p = 71 + int((i + 1) / len(records) * 8)
                    JobService.update_job(job_id, progress=sub_p)

            except Exception:
                final_to_save.append({"record": record, "embedding": all_embeddings[i]})

        JobService.update_job(job_id, progress=80) # Stage 3 DONE
        time.sleep(0.8)

        # Early exit if all skipped
        if not final_to_save:
            JobService.update_job(job_id, status="completed", progress=100, result={
                "filename": filename, "total_rows": len(records), "mysql_saved": 0, "chroma_saved": 0, "skipped": skipped_count,
                "message": "All records skipped."
            })
            return

        # 4. Start Stage 4 (MySQL)
        JobService.update_job(job_id, progress=81)
        filtered_records = [item["record"] for item in final_to_save]
        filtered_embeddings = [item["embedding"] for item in final_to_save]

        mysql_result = upsert_api_records(filtered_records)
        if not mysql_result["success"]:
            JobService.update_job(job_id, status="error", error=f"MySQL Save Failed: {mysql_result['error']}")
            return
        
        JobService.update_job(job_id, progress=90) # Stage 4 DONE
        time.sleep(0.8)

        # 5. Start Stage 5 (ChromaDB)
        JobService.update_job(job_id, progress=91)
        try:
            store_in_chroma(filtered_records, filtered_embeddings)
        except Exception as ve:
            JobService.update_job(job_id, status="error", error=f"ChromaDB Save Failed: {str(ve)}")
            return
        
        JobService.update_job(job_id, progress=100) # FINAL DONE
        time.sleep(0.5)

        # 7. Finalize
        result_summary = {
            "filename": filename,
            "total_rows": len(records),
            "mysql_saved": mysql_result["count"],
            "chroma_saved": len(records),
            "skipped": skipped_count,
            "message": "Data successfully processed and persisted to MySQL & ChromaDB"
        }
        
        JobService.update_job(job_id, status="completed", progress=100, result=result_summary)

    except Exception as e:
        import traceback
        error_msg = str(e)
        full_trace = traceback.format_exc()
        print(f"❌ Professional Background Error: {error_msg}")
        print(full_trace)
        JobService.update_job(job_id, status="error", error=error_msg)


@router.post("/process-async")
async def process_csv_async(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Start an asynchronous CSV ETL and Embedding job.
    Returns a Job ID immediately.
    """
    validation = CSVService.validate_file(file)
    if not validation["valid"]:
        raise HTTPException(status_code=400, detail=validation["error"])

    contents = await file.read()
    job_id = JobService.create_job("csv_transformation")
    
    # Add to background tasks
    background_tasks.add_task(background_csv_processor, job_id, contents, file.filename)
    
    return {
        "job_id": job_id,
        "message": "Processing started in background",
        "status_url": f"/csv/job/{job_id}"
    }


@router.get("/job/{job_id}")
async def get_job_status(job_id: str):
    """
    Check status of a background job
    """
    job = JobService.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/upload-and-preview")
async def upload_csv_preview(file: UploadFile = File(...)):
    """
    Upload CSV and return only preview (first 5 rows)
    """
    # Validate file
    validation = CSVService.validate_file(file)
    if not validation["valid"]:
        raise HTTPException(status_code=400, detail=validation["error"])
    
    # Parse CSV
    result = await CSVService.parse_csv(file)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Return only preview
    data = result["data"]
    return {
        "message": "CSV file preview generated",
        "filename": data["filename"],
        "row_count": data["row_count"],
        "columns": data["columns"],
        "preview": data["preview"]
    }

