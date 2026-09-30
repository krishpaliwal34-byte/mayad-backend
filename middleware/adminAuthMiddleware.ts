import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import Admin from "../models/Admin";

interface AdminToken extends JwtPayload {
  id: string;
  role: string;
}

export const adminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token = req.cookies?.mayad_admin_token || req.cookies?.adminToken;
    
    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Please login as CEO",
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is missing");
    }

    const decoded = jwt.verify(
      token,
      jwtSecret,
      {
        issuer: "mayad-admin",
        audience: "mayad-admin-dashboard",
      }
    ) as AdminToken;

    if (!decoded.id || decoded.role !== "CEO") {
      res.status(403).json({
        success: false,
        message: "CEO access only",
      });
      return;
    }

    const admin = await Admin.findOne({
      _id: decoded.id,
      role: "CEO",
      isActive: true,
    }).select("_id name email role");

    if (!admin) {
      res.status(401).json({
        success: false,
        message: "CEO account is not authorized",
      });
      return;
    }

    res.locals.admin = {
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired admin session",
    });
  }
};