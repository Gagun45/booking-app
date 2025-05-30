import { response, Router, type Request, type Response } from "express";
import Hotel from "../models/hotel";
import type { BookingType, HotelSearchResponse } from "../shared/types";
import { param, validationResult } from "express-validator";
import Stripe from "stripe";
import { verifyToken } from "../middleware/auth";

const router = Router();

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = constructSearchQuery(req.query);
    console.log("QUERY: ", query);
    let sortOptions = {};
    switch (req.query.sortOption) {
      case "starRating":
        sortOptions = { starRating: -1 };
        break;
      case "pricePerNightAsc":
        sortOptions = { pricePerNight: 1 };
        break;
      case "pricePerNightDesc":
        sortOptions = { pricePerNight: -1 };
        break;
    }
    const pageSize = 5;
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    );
    const skip = (pageNumber - 1) * pageSize;
    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);
    const total = await Hotel.find(query).countDocuments();
    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };
    res.json(response);
    return;
  } catch (error) {
    console.log("Search error: ", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
});

router.get(
  "/:pid",
  [param("pid").notEmpty().withMessage("Hotel PID is required")],
  async (req: Request, res: Response) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.status(400).json({ message: result.array()[0].msg });
      return;
    }
    try {
      const pid = req.params.pid;
      const hotel = await Hotel.findOne({ pid });
      if (!hotel) {
        res.status(404).json({ message: "Hotel not found" });
        return;
      }
      res.status(200).json(hotel);
      return;
    } catch (error) {
      console.log("Search error: ", error);
      res.status(500).json({ message: "Something went wrong" });
      return;
    }
  }
);

router.post(
  "/:pid/bookings/payment-intent",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { numberOfNights } = req.body;
      const pid = req.params.pid;
      const hotel = await Hotel.findOne({ pid });
      if (!hotel) {
        res.status(400).json({ message: "Hotel not found" });
        return;
      }

      const totalCost = hotel.pricePerNight * numberOfNights;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalCost*100,
        currency: "USD",
        metadata: {
          pid,
          userId: req.userId,
        },
      });

      if (!paymentIntent.client_secret) {
        res.status(500).json({ message: "Error creating payment intent" });
        return;
      }
      const response = {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret.toString(),
        totalCost,
      };
      res.send(response);
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
      return;
    }
  }
);

router.post(
  "/:pid/bookings",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const paymentIntentId = req.body.paymentIntentId;

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId as string
      );

      if (!paymentIntent) {
        res.status(400).json({ message: "Payment intent not found" });
        return;
      }

      if (
        paymentIntent.metadata.pid !== req.params.pid ||
        paymentIntent.metadata.userId !== req.userId
      ) {
        res.status(400).json({ message: "Payment intent mismatch" });
        return;
      }
      if (paymentIntent.status !== "succeeded") {
        res.status(400).json({
          message: `Payment intent not succeeded. Status: ${paymentIntent.status}`,
        });
        return;
      }

      const newBooking: BookingType = {
        ...req.body,
        userId: req.userId,
      };

      const hotel = await Hotel.findOneAndUpdate(
        { pid: req.params.pid },
        {
          $push: { bookings: newBooking },
        }
      );

      if (!hotel) {
        res.status(400).json({
          message: "Hotel not found",
        });
        return;
      }
      await hotel.save();
      res.status(200).send();
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
      return;
    }
  }
);
const constructSearchQuery = (queryParams: any) => {
  const constructedQuery: any = {};

  if (queryParams.destination) {
    constructedQuery.$or = [
      { city: new RegExp(queryParams.destination, "i") },
      { country: new RegExp(queryParams.destination, "i") },
    ];
  }

  if (queryParams.adultCount) {
    constructedQuery.adultCount = {
      $gte: parseInt(queryParams.adultCount),
    };
  }

  if (queryParams.childCount) {
    constructedQuery.childCount = {
      $gte: parseInt(queryParams.childCount),
    };
  }

  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star))
      : parseInt(queryParams.stars);
    constructedQuery.starRating = {
      $in: starRatings,
    };
  }

  if (queryParams.maxPrice && queryParams.maxPrice !== "0") {
    constructedQuery.pricePerNight = {
      $lte: parseInt(queryParams.maxPrice),
    };
  }

  return constructedQuery;
};

export default router;
