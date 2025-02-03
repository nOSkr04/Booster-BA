import asyncHandler from "../middleware/asyncHandle.js";
import User from "../models/User.js";
import MyError from "../utils/myError.js";

export const lessonPaymentSuccess = asyncHandler(async (req, res, next) => {
  const { id } = req.body;
  const user = await User.findById(id);

  if (!user) {
    throw new MyError("Хэрэглэгч олдсонгүй", 404);
  }
  try {
    user.isPayment = true;
    user.save();
    res.status(200).json(user);
  } catch (err) {
    throw new MyError("Серверийн алдаа", 500);
  }
});

export const bookPaymentSuccess = asyncHandler(async (req, res) => {
  const { id, bookCount } = req.body;
  const user = await User.findById(id);
  if (!user) {
    throw new MyError("Хэрэглэгч олдсонгүй", 404);
  }
  try {
    user.bookPaymentDate = new Date();
    user.bookBoughtCount = bookCount;
    user.isBoughtBook = true;
    user.save();
    res.status(200).json(user);
  } catch (err) {
    throw new MyError("Серверийн алдаа", 500);
  }
});
