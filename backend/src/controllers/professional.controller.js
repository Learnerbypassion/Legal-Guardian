const User = require("../models/user.model");
const { sendProfessionalContactEmail } = require("../services/email.service");

/**
 * GET /api/professionals/recommend?type=Lawyer
 * Get a list of recommended professionals based on type
 */
const recommendProfessionals = async (req, res) => {
  try {
    const { type } = req.query; // e.g., "Lawyer", "CA"

    if (!type) {
      return res.status(400).json({
        success: false,
        error: "Professional type is required (e.g., Lawyer, CA)",
      });
    }

    const professionals = await User.find({
      role: "professional",
      "professionalDetails.profession": type,
    }).select("name email phone professionalDetails");

    res.status(200).json({
      success: true,
      data: professionals,
    });
  } catch (error) {
    console.error("❌ Recommend professionals error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recommended professionals",
    });
  }
};

/**
 * POST /api/professionals/contact
 * Body: { professionalId }
 * Send an email to the professional on behalf of the current user
 */
const contactProfessional = async (req, res) => {
  try {
    const userId = req.userId;
    const { professionalId } = req.body;

    if (!professionalId) {
      return res.status(400).json({
        success: false,
        error: "Professional ID is required",
      });
    }

    const currentUser = await User.findById(userId);
    const professional = await User.findById(professionalId);

    if (!professional || professional.role !== "professional") {
      return res.status(404).json({
        success: false,
        error: "Professional not found",
      });
    }

    // Send email to professional
    await sendProfessionalContactEmail(
      professional.email,
      professional.name,
      currentUser.email,
      currentUser.name
    );

    res.status(200).json({
      success: true,
      message: "Email sent successfully to the professional.",
    });
  } catch (error) {
    console.error("❌ Contact professional error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to send email to the professional",
    });
  }
};

module.exports = {
  recommendProfessionals,
  contactProfessional,
};
