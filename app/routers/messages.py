"""
Messages Router for PneumAI
Messaging system for doctor-patient communication
"""

from fastapi import APIRouter, HTTPException
from typing import List
import logging

from app.models.schemas import MessageCreate, MessageResponse, MessageOnlyResponse
from app.database import (
    create_message,
    get_user_messages,
    mark_message_read,
    delete_message
)
from app.utils.helpers import generate_message_id
from app.utils.security import sanitize_input

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/user/{user_id}", response_model=List[MessageResponse])
async def get_messages_for_user(user_id: str):
    """
    Get all messages for a user (sent and received)

    Returns messages sorted by date (newest first)
    """
    try:
        messages = get_user_messages(user_id)
        return messages
    except Exception as e:
        logger.error(f"Error fetching messages for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch messages")


@router.post("", response_model=MessageResponse, status_code=201)
@router.post("/", response_model=MessageResponse, status_code=201)
async def send_message(message: MessageCreate):
    """
    Send a new message

    Creates message between sender and receiver
    """
    try:
        # Generate message ID
        message_id = generate_message_id()

        # Sanitize content
        content = sanitize_input(message.content, max_length=10000)

        # Prepare message data
        message_data = {
            'id': message_id,
            'senderId': message.senderId,
            'senderName': message.senderName,
            'senderRole': message.senderRole.value,
            'receiverId': message.receiverId,
            'receiverName': message.receiverName,
            'content': content
        }

        # Create message
        created_message = create_message(message_data)

        logger.info(f"✅ Message sent: {message_id} from {message.senderName} to {message.receiverName}")

        return created_message

    except Exception as e:
        logger.error(f"Error sending message: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message")


@router.put("/{message_id}/read", response_model=MessageResponse)
async def mark_message_as_read(message_id: str):
    """
    Mark a message as read

    Updates the read status of a message
    """
    try:
        updated_message = mark_message_read(message_id)

        if not updated_message:
            raise HTTPException(status_code=404, detail=f"Message not found: {message_id}")

        logger.info(f"✅ Message marked as read: {message_id}")

        return updated_message

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking message as read {message_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update message")


@router.delete("/{message_id}", response_model=MessageOnlyResponse)
async def delete_message_by_id(message_id: str):
    """
    Delete a message

    Removes message from the system
    """
    try:
        success = delete_message(message_id)

        if not success:
            raise HTTPException(status_code=404, detail=f"Message not found: {message_id}")

        logger.info(f"✅ Message deleted: {message_id}")

        return MessageOnlyResponse(message=f"Message {message_id} deleted successfully")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting message {message_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete message")
