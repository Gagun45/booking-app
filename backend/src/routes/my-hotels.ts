import { Router, type Request, type Response } from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import type { HotelType } from "../shared/types";
import Hotel from "../models/hotel";
import { verifyToken } from "../middleware/auth";
import { body } from "express-validator";
import cuid from "cuid";

const router = Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

router.post(
  "/",
  verifyToken,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("city").notEmpty().withMessage("Ciry is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("type").notEmpty().withMessage("Type is required"),
    body("pricePerNight")
      .notEmpty()
      .isNumeric()
      .withMessage("Price per night is required and must be a number"),
    body("facilities")
      .notEmpty()
      .isArray()
      .withMessage("Facilities are required"),
  ],
  upload.array("imageFiles", 6),
  async (req: Request, res: Response) => {
    try {
      const imageFiles = req.files as Express.Multer.File[];
      const newHotel: HotelType = req.body;

      const imageUrls = await uploadImages(imageFiles);

      newHotel.imageUrls = imageUrls;
      newHotel.lastUpdated = new Date();
      newHotel.userId = req.userId;
      newHotel.pid = cuid();

      const hotel = new Hotel(newHotel);
      await hotel.save();
      res.status(201).send(hotel);
      return;
    } catch (error) {
      console.log("Error creating hotel: ", error);
      res.status(500).json({ message: "Something went wrong" });
      return;
    }
  }
);

router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const hotels = await Hotel.find({ userId });
    res.json(hotels);
    return;
  } catch (error) {
    console.log("Error fetching hotels: ", error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.get("/:pid", verifyToken, async (req: Request, res: Response) => {
  try {
    const pid = req.params.pid.toString();
    const hotel = await Hotel.findOne({ pid, userId: req.userId });
    if (!hotel) {
      res.status(404).json({ message: "Hotel not found" });
      return;
    }
    res.json(hotel);
    return;
  } catch (error) {
    console.log("Error fetching hotel: ", error);
    res.status(500).json({ message: "Error fetching hotel" });
  }
});

router.put(
  "/:pid",
  verifyToken,
  upload.array("imageFiles"),
  async (req: Request, res: Response) => {
    try {
      const pid = req.params.pid.toString();
      const updatedHotel: HotelType = req.body;
      updatedHotel.lastUpdated = new Date();
      const hotel = await Hotel.findOneAndUpdate(
        { pid, userId: req.userId },
        updatedHotel,
        {
          new: true,
        }
      );
      if (!hotel) {
        res.status(404).json({ message: "Hotel not found" });
        return;
      }

      const files = req.files as Express.Multer.File[];

      const updatedImageUrls = await uploadImages(files);
      hotel.imageUrls = [
        ...updatedImageUrls,
        ...(updatedHotel.imageUrls || []),
      ];
      await hotel.save();
      res.status(201).json(hotel);
      return;
    } catch (error) {
      console.log("Error fetching hotel: ", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

async function uploadImages(imageFiles: Express.Multer.File[]) {
  const uploadPromises = imageFiles.map(async (image) => {
    const b64 = Buffer.from(image.buffer).toString("base64");
    let dataURI = "data:" + image.mimetype + ";base64," + b64;
    const res = await cloudinary.v2.uploader.upload(dataURI);
    return res.url;
  });

  const imageUrls = await Promise.all(uploadPromises);
  return imageUrls;
}

export default router;
