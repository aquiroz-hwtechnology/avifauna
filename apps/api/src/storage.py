import uuid
from datetime import datetime, timedelta, timezone
from azure.storage.blob import BlobServiceClient, ContentSettings, generate_blob_sas, BlobSasPermissions
from src.config import settings


def get_blob_service_client():
    return BlobServiceClient.from_connection_string(settings.AZURE_STORAGE_CONNECTION_STRING)


def _get_account_name_and_key():
    parts = dict(
        part.split("=", 1)
        for part in settings.AZURE_STORAGE_CONNECTION_STRING.split(";")
        if "=" in part
    )
    return parts.get("AccountName", ""), parts.get("AccountKey", "")


async def upload_photo(image_bytes: bytes, content_type: str = "image/jpeg") -> str:
    client = get_blob_service_client()
    blob_name = f"{uuid.uuid4()}.jpg"
    blob = client.get_blob_client(
        container=settings.AZURE_STORAGE_CONTAINER, blob=blob_name
    )
    blob.upload_blob(
        image_bytes,
        overwrite=True,
        content_settings=ContentSettings(content_type=content_type),
    )

    account_name, account_key = _get_account_name_and_key()
    sas = generate_blob_sas(
        account_name=account_name,
        container_name=settings.AZURE_STORAGE_CONTAINER,
        blob_name=blob_name,
        account_key=account_key,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.now(timezone.utc) + timedelta(days=365),
    )
    return f"{blob.url}?{sas}"
