import { Request, Response } from "express";
import Inquiry from "../models/Inquiry";

const InquiryModel: any = Inquiry;

// ============================================================
// PUBLIC: SUBMIT CONTACT INQUIRY
// POST /api/inquiries
// ============================================================
export const createInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, subject, category, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        message: "Name, email, subject, and message are required fields.",
      });
      return;
    }

    const inquiry = await InquiryModel.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone || "").trim(),
      subject: String(subject).trim(),
      category: category || "General",
      message: String(message).trim(),
      status: "Pending",
      isRead: false,
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Your inquiry has been submitted to MAYAD Team successfully.",
      inquiry,
    });
  } catch (error: any) {
    console.error("Create inquiry error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit inquiry. Please try again later.",
    });
  }
};

// ============================================================
// ADMIN: GET ALL INQUIRIES WITH FILTERS & SEARCH
// GET /api/admin/inquiries
// ============================================================
export const adminGetInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = String(req.query.status || "all");
    const category = String(req.query.category || "all");
    const search = String(req.query.q || "").trim();

    const queryFilter: any = {};
    if (status !== "all") queryFilter.status = status;
    if (category !== "all") queryFilter.category = category;

    if (search) {
      const regex = new RegExp(search, "i");
      queryFilter.$or = [
        { name: regex },
        { email: regex },
        { subject: regex },
        { phone: regex },
        { message: regex },
      ];
    }

    const inquiries = await InquiryModel.find(queryFilter)
      .sort({ createdAt: -1 })
      .limit(100);

    const totalCount = await InquiryModel.countDocuments(queryFilter);
    const pendingCount = await InquiryModel.countDocuments({ status: "Pending" });
    const unreadCount = await InquiryModel.countDocuments({ isRead: false });

    res.json({
      success: true,
      count: totalCount,
      pendingCount,
      unreadCount,
      inquiries,
    });
  } catch (error: any) {
    console.error("Admin get inquiries error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inquiries list",
    });
  }
};

// ============================================================
// ADMIN: UPDATE INQUIRY STATUS OR READ STATE
// PATCH /api/admin/inquiries/:id/status
// ============================================================
export const adminUpdateInquiryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, isRead } = req.body;

    const inquiry = await InquiryModel.findById(id);
    if (!inquiry) {
      res.status(404).json({
        success: false,
        message: "Inquiry record not found",
      });
      return;
    }

    if (status) inquiry.status = status;
    if (isRead !== undefined) inquiry.isRead = Boolean(isRead);

    await inquiry.save();

    res.json({
      success: true,
      message: "Inquiry status updated successfully",
      inquiry,
    });
  } catch (error: any) {
    console.error("Update inquiry error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update inquiry",
    });
  }
};

// ============================================================
// ADMIN: DELETE INQUIRY
// DELETE /api/admin/inquiries/:id
// ============================================================
export const adminDeleteInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const inquiry = await InquiryModel.findByIdAndDelete(id);

    if (!inquiry) {
      res.status(404).json({
        success: false,
        message: "Inquiry record not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Inquiry record deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete inquiry error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete inquiry",
    });
  }
};
