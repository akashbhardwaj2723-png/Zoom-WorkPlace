import { User } from "../models/users.models.js";
import crypto from "node:crypto";
import httpStatus from "http-status";
import bcrypt, { hash } from "bcrypt";
import { Meeting } from "../models/meeting.model.js";

import { json } from "express";

const login = async (req, res) => {
  const { userName, password } = req.body;
  try {
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(400).json({ message: "Invalid UserName & Password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid UserName & Password",
      });
    }
    const token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    await user.save();
    return res
      .status(httpStatus.OK)
      .json({ message: "Login Successful", token: token });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Something went wrong ${err.message}` });
  }
};

const register = async (req, res) => {
  const { name, userName, password } = req.body;
  try {
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res
        .status(httpStatus.CONFLICT)
        .json({ message: "User Allready exist" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name,
      userName: userName,
      password: hashedPassword,
    });
    await newUser.save();
    return res
      .status(httpStatus.CREATED)
      .json({ message: "User Registered Successfully" });
  } catch (err) {
    return res.status(500).json(`Something Went Wrong ${err.message}`);
  }
};

 
const getUserHistory = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(401).json({
        message: "User not found. Please login again."
      });
    }

    const meetings = await Meeting.find({
      user_id: user.userName
    });

    return res.status(200).json(meetings);

  } catch (err) {
    console.error("getUserHistory error:", err);

    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};


const addHistory = async (req, res) => {
  const { token, meeting_code } = req.body;
  try {
    const user = await User.findOne({ token: token });
    const newMetting = new Meeting({
      user_id: user.userName,
      meetingCode: meeting_code,
    });
    await newMetting.save();
    res.status(httpStatus.CREATED).json({
      message: "Success",
    });
  } catch (e) {
     res.json({ message: `Something went wrong ${e}`});
  }
};

export { login , register , addHistory , getUserHistory };
