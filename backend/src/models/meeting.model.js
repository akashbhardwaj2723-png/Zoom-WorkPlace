import mongoose, { Schema, Types } from "mongoose";

const meetingModel = new Schema({
  user_id: {
    type: String,
  },
  meetingCode: {
    type: String,
    required: true,
  },
  data: {
    type: String,
    default: Date.now,
    required: true,
  },
});

const Meeting = mongoose.model("Meeting", meetingModel);

export  {Meeting};
