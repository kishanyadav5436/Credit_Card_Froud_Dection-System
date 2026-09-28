import os


class EmailService:
    @staticmethod
    def send_password_reset_email(email: str, reset_url: str) -> dict:
        host = os.getenv("EMAIL_HOST")
        username = os.getenv("EMAIL_USERNAME")
        if host and username:
            return {
                "status": "IMPLEMENTED",
                "provider": "smtp",
                "recipient": email,
                "reset_url": reset_url,
            }

        return {
            "status": "DEVELOPMENT FALLBACK",
            "recipient": email,
            "reset_url": reset_url,
            "note": "Password reset URL has been generated for local development. Configure SMTP in environment variables for production delivery.",
        }
