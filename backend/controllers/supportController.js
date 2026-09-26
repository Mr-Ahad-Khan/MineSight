const asyncHandler = require("express-async-handler");
const SupportTicket = require("../models/SupportTicket");

// Emergency contacts and guidelines directory for coal mining operations
const EMERGENCY_DIRECTORY = [
  {
    category: "Emergency & Disaster Response",
    contacts: [
      {
        title: "DGMS National Mine Emergency Control Room",
        number: "1800-345-3467",
        alt: "0326-2221000",
        timing: "24/7 Available",
        badge: "Immediate SOS",
      },
      {
        title: "Central Coalfields Rescue Station (Dhanbad / Singrauli)",
        number: "0326-2202356",
        alt: "07805-266120",
        timing: "24/7 Emergency Dispatch",
        badge: "Underground Rescue",
      },
      {
        title: "CIL Safety & Health Directorate",
        number: "033-23246633",
        timing: "08:00 - 20:00 IST",
        badge: "Statutory Reporting",
      },
    ],
  },
  {
    category: "Technical & Systems Support",
    contacts: [
      {
        title: "MineSight IoT & Telemetry Hotline",
        number: "+91 800-419-7890",
        email: "support@minesight.cil.gov.in",
        timing: "24/7 Technical Ops",
        badge: "System Helpdesk",
      },
      {
        title: "DGMS Portal Sync & Statutory Filing Helpdesk",
        number: "+91 11-2338-9011",
        email: "dgms-portal@nic.in",
        timing: "09:30 - 18:00 IST",
        badge: "Compliance",
      },
    ],
  },
];

// @desc    Get support directory and emergency hotlines
// @route   GET /api/support/directory
// @access  Private
const getSupportDirectory = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: EMERGENCY_DIRECTORY,
  });
});

// @desc    Get tickets for current user or all tickets for admin
// @route   GET /api/support/tickets
// @access  Private
const getTickets = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role !== "admin" && req.user.role !== "regulator") {
    query.userId = req.user._id;
  }
  if (req.query.status) query.status = req.query.status;
  if (req.query.category) query.category = req.query.category;
  if (req.query.priority) query.priority = req.query.priority;

  const tickets = await SupportTicket.find(query)
    .populate("mineId", "name code subsidiary")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: tickets.length,
    data: tickets,
  });
});

// @desc    Create new support ticket
// @route   POST /api/support/tickets
// @access  Private
const createTicket = asyncHandler(async (req, res) => {
  const { subject, category, priority, description, mineId } = req.body;

  if (!subject || !description) {
    res.status(400);
    throw new Error("Subject and description are required");
  }

  const count = await SupportTicket.countDocuments();
  const ticketNumber = `MS-${String(count + 1001).padStart(5, "0")}`;

  const ticket = await SupportTicket.create({
    ticketNumber,
    userId: req.user._id,
    userName: req.user.name,
    userEmail: req.user.email,
    mineId: mineId || req.user.mineId,
    subject: subject.trim(),
    category: category || "general",
    priority: priority || "medium",
    description: description.trim(),
    status: "open",
    responses: [
      {
        sender: "MineSight Automated Helpdesk",
        senderRole: "system",
        message: `Your ticket ${ticketNumber} has been logged with ${priority || "medium"} priority. An on-duty engineer or safety officer will review it shortly.`,
        createdAt: new Date(),
      },
    ],
  });

  const populated = await SupportTicket.findById(ticket._id).populate(
    "mineId",
    "name code subsidiary"
  );

  res.status(201).json({
    success: true,
    message: `Support ticket ${ticketNumber} created successfully`,
    data: populated,
  });
});

// @desc    Get ticket by ID
// @route   GET /api/support/tickets/:id
// @access  Private
const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id).populate(
    "mineId",
    "name code subsidiary"
  );

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  res.json({
    success: true,
    data: ticket,
  });
});

// @desc    Add reply or comment to ticket
// @route   POST /api/support/tickets/:id/responses
// @access  Private
const addTicketResponse = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    res.status(400);
    throw new Error("Message text is required");
  }

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  ticket.responses.push({
    sender: req.user.name || "User",
    senderRole: req.user.role || "user",
    message: message.trim(),
    createdAt: new Date(),
  });

  if (req.user.role === "admin" && ticket.status === "open") {
    ticket.status = "in_progress";
  }

  await ticket.save();

  const populated = await SupportTicket.findById(ticket._id).populate(
    "mineId",
    "name code subsidiary"
  );

  res.json({
    success: true,
    data: populated,
  });
});

module.exports = {
  getSupportDirectory,
  getTickets,
  createTicket,
  getTicketById,
  addTicketResponse,
};
