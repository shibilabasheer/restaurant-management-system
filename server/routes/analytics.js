import express from "express";
import Order from "../models/Order.js";
import Reservation from "../models/Reservation.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.get("/dashboard", protect, async (req, res) => {
  try {
    const revenueByType = await Order.aggregate([
      { $match: { type: { $in: ["dinein", "delivery","takeway"] } } },
      {
        $group: {
          _id: "$type",
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const reservationTrends = await Reservation.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalReservations: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const popularDishes = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menu",
          totalOrdered: { $sum: "$items.qty" },
          totalRevenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
        },
      },
      {
        $lookup: {
          from: "menus",
          localField: "_id",
          foreignField: "_id",
          as: "menu",
        },
      },
      { $unwind: "$menu" },
      { $sort: { totalOrdered: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          name: "$menu.name",
          image: "$menu.image",
          totalOrdered: 1,
          totalRevenue: 1,
        },
      },
    ]);

    const monthlyRevenue = await Order.aggregate([
      { $match: { status: { $in: ["paid", "delivered"] } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    res.json({
      revenueByType,
      reservationTrends,
      popularDishes,
      monthlyRevenue,
    });
  } catch (err) {
    console.error("Dashboard analytics error:", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

export default router;
