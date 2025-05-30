import { Router, type Request, type Response } from "express";
import { verifyToken } from "../middleware/auth";
import Hotel from "../models/hotel";
import { error } from "console";
import type { HotelType } from "../shared/types";

const router = Router();

router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find({ "bookings.userId": req.userId });

    const results = hotels.map((hotel) => {
      const userBookings = hotel.bookings.filter(
        (booking) => booking.userId === req.userId
      );
      const hotelWithUserBookings: HotelType = {
        ...hotel.toObject(),
        bookings: userBookings,
      };
      return hotelWithUserBookings;
    });

    res.status(200).json(results);
    return;
  } catch (err) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
});

export default router;
