import boto3
from botocore.exceptions import NoCredentialsError, ClientError
import os
from datetime import datetime
from typing import List, Optional
import re

class S3Service:
    def __init__(self):
        self.bucket_name = os.getenv('S3_BUCKET_NAME', 'dev-jhpark')
        self.aws_region = os.getenv('AWS_REGION', 'ap-northeast-2')
        
        if not self.bucket_name:
            raise ValueError("S3_BUCKET_NAME environment variable is required")
        
        # EC2 IAM 역할을 사용하여 자격증명 자동 획득
        self.s3_client = boto3.client(
            's3',
            region_name=self.aws_region
        )
    
    def upload_note(self, title: str, content: str) -> dict:
        try:
            current_date = datetime.now()
            date_folder = current_date.strftime("%Y-%m-%d")
            
            safe_title = re.sub(r'[^\w\s-]', '', title).strip()
            safe_title = re.sub(r'[\s]+', '_', safe_title)
            filename = f"{safe_title}.md"
            s3_key = f"ubinote/{date_folder}/{filename}"
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=content,
                ContentType='text/markdown'
            )
            
            return {
                "success": True,
                "filename": s3_key,
                "message": "Note uploaded successfully"
            }
        except NoCredentialsError:
            return {
                "success": False,
                "message": "AWS credentials not found"
            }
        except ClientError as e:
            return {
                "success": False,
                "message": f"AWS S3 error: {e}"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Unexpected error: {e}"
            }
    
    def list_notes(self) -> dict:
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix='ubinote/',
            )
            
            notes = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    if obj['Key'].endswith('.md'):
                        # Extract filename from full path
                        filename_only = obj['Key'].split('/')[-1]
                        display_title = filename_only.replace('.md', '').replace('_', ' ')
                        
                        # Extract date from path (ubinote/2025-09-08/filename.md)
                        path_parts = obj['Key'].split('/')
                        date_folder = path_parts[1] if len(path_parts) > 1 else 'unknown'
                        
                        notes.append({
                            "filename": obj['Key'],
                            "title": display_title,
                            "date_folder": date_folder,
                            "last_modified": obj['LastModified'].isoformat(),
                            "size": obj['Size']
                        })
            
            notes.sort(key=lambda x: x['last_modified'], reverse=True)
            
            return {
                "success": True,
                "notes": notes,
                "message": f"Found {len(notes)} notes"
            }
        except NoCredentialsError:
            return {
                "success": False,
                "message": "AWS credentials not found"
            }
        except ClientError as e:
            return {
                "success": False,
                "message": f"AWS S3 error: {e}"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Unexpected error: {e}"
            }
    
    def download_note(self, filename: str) -> dict:
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=filename
            )
            
            content = response['Body'].read().decode('utf-8')
            
            # Extract title from full path
            filename_only = filename.split('/')[-1]
            display_title = filename_only.replace('.md', '').replace('_', ' ')
            
            return {
                "success": True,
                "data": {
                    "filename": filename,
                    "title": display_title,
                    "content": content,
                    "last_modified": response['LastModified'].isoformat()
                },
                "message": "Note downloaded successfully"
            }
        except NoCredentialsError:
            return {
                "success": False,
                "message": "AWS credentials not found"
            }
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                return {
                    "success": False,
                    "message": "Note not found"
                }
            return {
                "success": False,
                "message": f"AWS S3 error: {e}"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Unexpected error: {e}"
            }