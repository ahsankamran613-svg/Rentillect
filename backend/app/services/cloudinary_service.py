import cloudinary
import cloudinary.uploader
import cloudinary.api
from fastapi import UploadFile, HTTPException, status
from backend.app.config import get_settings


class CloudinaryService:
    def __init__(self):
        settings = get_settings()
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )

    async def upload_property_image(self, file: UploadFile, property_id: str) -> dict:
        """Uploads a property image to Cloudinary in webp format under rentillect/properties folder."""
        try:
            contents = await file.read()
            upload_result = cloudinary.uploader.upload(
                contents,
                folder=f"rentillect/properties/{property_id}",
                transformation=[
                    {"width": 1280, "height": 800, "crop": "limit"},
                    {"quality": "auto", "fetch_format": "webp"}
                ]
            )
            return {
                "url": upload_result.get("secure_url"),
                "public_id": upload_result.get("public_id")
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Cloudinary image upload failed: {str(e)}"
            )

    def delete_image(self, public_id: str) -> bool:
        """Deletes an image from Cloudinary using its public_id."""
        try:
            res = cloudinary.uploader.destroy(public_id)
            return res.get("result") == "ok"
        except Exception:
            return False
