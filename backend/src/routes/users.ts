import { Router, Request, Response } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.post(
  "/register",
  [
    check("firstName", "First Name is required").isString(),
    check("lastName", "Last Name is required").isString(),
    check("email", "Email is required").isEmail().withMessage("Invalid email"),
    check("password", "Pass with 6 or more char required").isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array()[0].msg });
      return;
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        res.status(400).json({ message: "User already exists" });
        return;
      }
      user = new User(req.body);
      await user.save();
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET_KEY as string,
        {
          expiresIn: "1d",
        }
      );
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000,
      });
      res.status(200).json({ message: "User registered OK" });
      return;
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Something went wrong" });
    }
  }
);

router.get("/me", verifyToken, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-password -_id");
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }
    res.json(user);
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Something went wrong" });
  }
});

export default router;
