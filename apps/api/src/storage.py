import uuid
from azure.storage.blob import BlobServiceClient, ContentSettings
from src.config import settings


def get_blob_client():
    return BlobServiceClient.from_connection_string(settings.AZURE_STORAGE_CONNECTION_STRING)


async def upload_photo(image_bytes: bytes, content_type: str = "image/jpeg") -> str:
    client = get_blob_client()
    blob_name = f"{uuid.uuid4()}.jpg"
    blob = client.get_blob_client(container=settings.AZURE_STORAGE_CONTAINER, blob=blob_name)
    blob.upload_blob(
        image_bytes,
        overwrite=True,
        content_settings=ContentSettings(content_type=content_type),
    )
    return blob.url
