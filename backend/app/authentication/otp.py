import secrets
import smtplib
from email.message import EmailMessage
from flask import current_app

def generate_otp():
    return secrets.randbelow(9000) + 1000

def send_otp(email, username="User"):
    otp = generate_otp()

    msg = EmailMessage()
    msg["From"] = current_app.config["EMAIL_USER"]
    msg["To"] = email
    msg["Subject"] = "OTP Verification"
    msg.set_content(f"{username}, your OTP is {otp}")

    server = smtplib.SMTP_SSL(
        current_app.config["SMTP_HOST"],
        current_app.config["SMTP_PORT"]
    )
    server.login(
        current_app.config["EMAIL_USER"],
        current_app.config["EMAIL_PASS"]
    )
    server.send_message(msg)
    server.quit()

    return otp
