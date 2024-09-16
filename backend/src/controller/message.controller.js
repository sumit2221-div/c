import { Message } from "../models/message.model.js";
import mongoose from 'mongoose';

export const getChatHistory = async (req, res) => {
    const userId = req.user._id;  
    const { senderId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(senderId)) {
        return res.status(400).json({ message: 'Invalid user ID or sender ID' });
    }

    try {
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: senderId },
                { sender: senderId, receiver: userId }
            ]
        }).sort({ timestamp: 1 }); // Ensure sorting by the correct field

        // Check if messages are found
        if (messages.length === 0) {
            return res.status(404).json({ message: 'No chat history found' });
        }

        // Return messages
        res.json({ messages });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching chat history', error });
    }
};
