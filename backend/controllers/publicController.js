const asyncHandler = require("express-async-handler");
const Mine = require("../models/Mine");
const Inspection = require("../models/Inspection");
const Compliance = require("../models/Compliance");
const Alert = require("../models/Alert");
const ChatMessage = require("../models/ChatMessage");
const nodemailer = require("nodemailer");

const contactRecipient = "mrkhanahad723@gmail.com";

const getEmailTransport = () => {
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASSWORD
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === "true",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });
};

const sendContactEmail = async ({
  name,
  email,
  organization,
  subject,
  message,
}) => {
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Organization: ${organization || "Not provided"}`,
    `Subject: ${subject}`,
    "",
    message,
  ].join("\n");

  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: [contactRecipient],
        reply_to: email,
        subject: `MineSight contact form: ${subject}`,
        text,
      }),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(
        result.message || "Email provider rejected the contact form",
      );
    }
    return;
  }

  const transport = getEmailTransport();
  if (!transport) {
    throw new Error(
      "Contact email is not configured. Set RESEND_API_KEY or SMTP settings.",
    );
  }

  await transport.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: contactRecipient,
    replyTo: email,
    subject: `MineSight contact form: ${subject}`,
    text,
  });
};

const getHomeStats = asyncHandler(async (req, res) => {
  const [
    activeMines,
    openInspections,
    complianceReports,
    inspectionReports,
    alertReports,
    totalAlerts,
    mines,
  ] = await Promise.all([
    Mine.countDocuments({ status: "active" }),
    Inspection.countDocuments({
      status: { $in: ["open", "in_progress", "escalated"] },
    }),
    Compliance.countDocuments(),
    Inspection.countDocuments(),
    Alert.countDocuments(),
    Alert.countDocuments(),
    Mine.find({ status: "active" }).select("complianceScore"),
  ]);

  const averageCompliance = mines.length
    ? Number(
        (
          mines.reduce((total, mine) => total + mine.complianceScore, 0) /
          mines.length
        ).toFixed(1),
      )
    : 0;

  res.json({
    success: true,
    data: {
      activeMines,
      averageCompliance,
      openInspections,
      totalReports: complianceReports + inspectionReports + alertReports,
      totalAlerts,
    },
  });
});

const createChatMessage = asyncHandler(async (req, res) => {
  const { email, message, reply } = req.body;
  if (!email || !message || !reply) {
    res.status(400);
    throw new Error("Email, message, and reply are required");
  }

  const chatMessage = await ChatMessage.create({ email, message, reply });
  res.status(201).json({ success: true, data: { id: chatMessage._id } });
});

const createContactMessage = asyncHandler(async (req, res) => {
  const { name, email, organization, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error("Name, email, subject, and message are required");
  }

  await sendContactEmail({ name, email, organization, subject, message });
  res
    .status(202)
    .json({ success: true, message: "Contact message sent successfully" });
});

const getChatMessages = asyncHandler(async (req, res) => {
  const messages = await ChatMessage.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .select("-__v");
  res.json({ success: true, data: messages });
});

const translateText = asyncHandler(async (req, res) => {
  const { texts, targetLanguage, sourceLanguage = "en" } = req.body;

  if (
    !Array.isArray(texts) ||
    texts.length === 0 ||
    texts.length > 50 ||
    !targetLanguage
  ) {
    res.status(400);
    throw new Error("Provide 1-50 texts and a target language");
  }

  if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
    res.status(503);
    throw new Error("Online translation is not configured");
  }

  const params = new URLSearchParams({
    key: process.env.GOOGLE_TRANSLATE_API_KEY,
    target: targetLanguage,
    source: sourceLanguage,
    format: "text",
  });
  texts.forEach((text) => params.append("q", String(text)));

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?${params}`,
    { method: "POST" },
  );
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    res.status(502);
    throw new Error(result.error?.message || "Google translation failed");
  }

  res.json({
    success: true,
    data: result.data.translations.map((item) => item.translatedText),
  });
});

module.exports = {
  getHomeStats,
  createChatMessage,
  createContactMessage,
  getChatMessages,
  translateText,
};
