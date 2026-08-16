import Message from "../models/Message.js";
import User from "../models/User.js";
import { isDatabaseConnected } from "../config/db.js";
import { fallbackStore } from "../data/fallbackStore.js";

export const getMessages = async (req, res) => {
  const userId = req.user._id;
  if (!isDatabaseConnected()) {
    const list = await fallbackStore.getMessages(String(userId));
    const populated = await Promise.all(
      list.map(async (msg) => {
        const sender = await fallbackStore.findUserById(msg.sender);
        const receiver = await fallbackStore.findUserById(msg.receiver);
        return {
          ...msg,
          sender: sender ? { _id: sender._id, name: sender.name, role: sender.role, profilePhoto: sender.profilePhoto } : null,
          receiver: receiver ? { _id: receiver._id, name: receiver.name, role: receiver.role, profilePhoto: receiver.profilePhoto } : null
        };
      })
    );
    return res.json(populated);
  }

  const list = await Message.find({
    $or: [{ sender: userId }, { receiver: userId }]
  })
    .populate("sender", "name role profilePhoto")
    .populate("receiver", "name role profilePhoto")
    .sort({ createdAt: 1 });

  res.json(list);
};

export const sendMessage = async (req, res) => {
  const { receiverId, text } = req.body;
  const senderId = req.user._id;

  if (!receiverId || !text) {
    return res.status(400).json({ message: "receiverId and text are required" });
  }

  if (!isDatabaseConnected()) {
    const msg = await fallbackStore.sendMessage(String(senderId), receiverId, text);
    const sender = await fallbackStore.findUserById(msg.sender);
    const receiver = await fallbackStore.findUserById(msg.receiver);

    await fallbackStore.addNotification(receiverId, {
      title: "New Message",
      message: `You received a message from ${sender?.name || "Traveler"}`
    });

    return res.status(201).json({
      ...msg,
      sender: sender ? { _id: sender._id, name: sender.name, role: sender.role, profilePhoto: sender.profilePhoto } : null,
      receiver: receiver ? { _id: receiver._id, name: receiver.name, role: receiver.role, profilePhoto: receiver.profilePhoto } : null
    });
  }

  const msg = await Message.create({
    sender: senderId,
    receiver: receiverId,
    text
  });

  const receiver = await User.findById(receiverId);
  if (receiver) {
    receiver.notifications.push({
      title: "New Message",
      message: `You received a message from ${req.user.name}`
    });
    await receiver.save();
  }

  res.status(201).json(
    await msg.populate([
      { path: "sender", select: "name role profilePhoto" },
      { path: "receiver", select: "name role profilePhoto" }
    ])
  );
};
