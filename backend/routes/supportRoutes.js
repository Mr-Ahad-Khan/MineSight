const express = require("express");
const router = express.Router();
const {
  getSupportDirectory,
  getTickets,
  createTicket,
  getTicketById,
  addTicketResponse,
  updateTicket,
  deleteTicket,
} = require("../controllers/supportController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/directory", getSupportDirectory);
router.route("/tickets").get(getTickets).post(createTicket);
router.route("/tickets/:id").get(getTicketById).patch(updateTicket).delete(deleteTicket);
router.route("/tickets/:id/responses").post(addTicketResponse);

module.exports = router;
