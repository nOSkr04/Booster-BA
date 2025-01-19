import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

export const getNotifications = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  const user = await User.findById(req.userId);
  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй.", 400);
  }

  const query = { users: user._id };

  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Notification.find(query));

  const notifications = await Notification.find(query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  await Notification.updateMany(
    { users: user._id },
    { $set: { isRead: true } }
  );

  user.notificationCount = 0;
  user.save();

  res.status(200).json({
    success: true,
    data: notifications,
    count: notifications.length,
    pagination,
  });
});
