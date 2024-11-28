import User from "../models/User.js";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import axios from "axios";
import Wallet from "../models/Wallet.js";
import { format, startOfDay } from "date-fns";
import bcrypt from "bcrypt";

export const authMeUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new MyError(req.params.id, 401);
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

// register
export const register = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  const token = user.getJsonWebToken();

  res.status(200).json({
    success: true,
    token,
    user: user,
  });
});

// логин хийнэ
export const login = asyncHandler(async (req, res, next) => {
  const { phone, password } = req.body;

  // Оролтыгоо шалгана

  if (!phone || !password) {
    throw new MyError("Имэл болон нууц үйгээ дамжуулна уу", 400);
  }

  // Тухайн хэрэглэгчийн хайна
  const user = await User.findOne({ phone }).select("+password");

  if (!user) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 401);
  }

  const ok = await user.checkPassword(password);

  if (!ok) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 401);
  }

  const token = user.getJsonWebToken();

  const cookieOption = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000000),
    httpOnly: true,
  };

  res.status(200).cookie("amazon-token", token, cookieOption).json({
    success: true,
    token,
    user: user,
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  const cookieOption = {
    expires: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000000),
    httpOnly: true,
  };

  res.status(200).cookie("amazon-token", null, cookieOption).json({
    success: true,
    data: "logged out...",
  });
});

export const getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, User);

  const users = await User.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  res.status(200).json({
    success: true,
    data: users,
    pagination,
    total: pagination.total,
    pageCount: pagination.pageCount,
  });
});

export const dashboard = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  const filterPayed = users.filter((user) => user.isPayment);
  const startDate = new Date("2023-11-013");
  const endDate = new Date();

  // Generate an array of dates between startDate and endDate
  const dateRange = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    dateRange.push(currentDate);
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const aggregationPipeline = [
    {
      $match: {
        paymentDate: {
          $gte: startDate,
          $lte: endDate,
        },
        // Add other query conditions as needed
        ...req.query,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$paymentDate" },
          month: { $month: "$paymentDate" },
          day: { $dayOfMonth: "$paymentDate" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
          },
        },
        count: 1,
      },
    },
  ];
  const aggregationPipeline1 = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        // Add other query conditions as needed
        ...req.query,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
          },
        },
        count: 1,
      },
    },
  ];

  const dailyUserCounts = await User.aggregate(aggregationPipeline);
  const dailyUserCreateCounts = await User.aggregate(aggregationPipeline1);
  const filteredDailyUserCounts = dateRange.map((date) => {
    const matchingRecord = dailyUserCounts.find(
      (record) =>
        startOfDay(record.date).getTime() === startOfDay(date).getTime()
    );

    return {
      date: format(date, "MM/dd"),
      count: matchingRecord ? matchingRecord.count : 0,
    };
  });
  const filteredDailyUserCounts1 = dateRange.map((date) => {
    const matchingRecord = dailyUserCreateCounts.find(
      (record) =>
        startOfDay(record.date).getTime() === startOfDay(date).getTime()
    );

    return {
      date: format(date, "MM/dd"),
      count: matchingRecord ? matchingRecord.count : 0,
    };
  });

  const dateStrings1 = filteredDailyUserCounts1.map((record) => record.date);
  const countNumbers1 = filteredDailyUserCounts1.map((record) => record.count);

  const dashedStatic1 = {
    dateStrings: dateStrings1,
    countNumbers: countNumbers1,
  };
  const dateStrings = filteredDailyUserCounts.map((record) => record.date);
  const countNumbers = filteredDailyUserCounts.map((record) => record.count);

  const dashedStatic = {
    dateStrings: dateStrings,
    countNumbers: countNumbers,
  };

  res.status(200).json({
    allUserCount: users.length,
    netWorth: filterPayed.length * 20000,
    payedUser: filterPayed.length,
    unpayedUser: users.length - filterPayed.length,
    dailyUserCounts: dashedStatic,
    dailyUserCreateCounts: dashedStatic1,
  });
});

export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(200).json({
    success: true,
    data: user,
  });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  user.remove();

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const getToken = async () => {
  const response = await fetch("https://merchant.qpay.mn/v2/auth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic Qk9PU1RFUlNfTU46UzhFZ1ROM2Y=`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data.access_token;
};

export const createInvoiceByBook = asyncHandler(async (req, res, next) => {
  const profile = await User.findById(req.userId);
  const wallet = await Wallet.create({});
  const token = await getToken();
  const response = await fetch("https://merchant.qpay.mn/v2/invoice", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invoice_code: "BOOSTERS_MN_INVOICE",
      sender_invoice_no: "12345678",
      invoice_receiver_code: `${profile.phone}`,
      invoice_description: `Book ${profile.phone}`,
      amount: 29000,
      callback_url: `https://www.server.boosters.mn/api/v1/users/callback/${wallet._id}/${profile._id}/book`,
    }),
  });
  const data = await response.json();
  wallet.set({
    qrImage: data.qr_image,
    invoiceId: data.invoice_id,
    amout: 29000,
    urls: data.urls,
    invoiceType: "BOOK",
  });
  wallet.save();
  res.status(200).json(wallet._id);
});

export const createInvoiceByLesson = asyncHandler(async (req, res, next) => {
  const profile = await User.findById(req.userId);
  const wallet = await Wallet.create({});
  const token = await getToken();
  const response = await fetch("https://merchant.qpay.mn/v2/invoice", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invoice_code: "BOOSTERS_MN_INVOICE",
      sender_invoice_no: "12345678",
      invoice_receiver_code: `${profile.phone}`,
      invoice_description: `Lesson ${profile.phone}`,
      amount: 50000,
      callback_url: `https://www.server.boosters.mn/api/v1/users/callback/${wallet._id}/${profile._id}/lesson`,
    }),
  });
  const data = await response.json();
  wallet.set({
    qrImage: data.qr_image,
    invoiceId: data.invoice_id,
    amout: 50000,
    urls: data.urls,
    invoiceType: "LESSON",
  });
  wallet.save();
  res.status(200).json(wallet._id);
});

export const invoiceByBookConfirmed = asyncHandler(async (req, res) => {
  const { walletId, userId } = req.params;
  const user = User.findById(userId);
  const wallet = Wallet.findById(walletId);
  user.set({
    isBoughtBook: true,
  });
  wallet.set({
    isPayed: true,
  });
  user.save();
  wallet.save();
  res.status(200).json({
    success: true,
  });
});
export const invoiceByBookLesson = asyncHandler(async (req, res) => {
  const { walletId, userId } = req.params;
  const user = User.findById(userId);
  const wallet = Wallet.findById(walletId);
  user.set({
    isPayment: true,
  });
  wallet.set({
    isPayed: true,
  });
  user.save();
  wallet.save();
  res.status(200).json({
    success: true,
  });
});

export const invoiceByQpayCheck = asyncHandler(async (req, res) => {
  const { id, type } = req.params;
  console.log(id, type);
  const user = await User.findById(req.userId);
  const wallet = await Wallet.findOne({ invoiceId: id });
  if (!wallet) {
    throw new MyError("Төлбөр амжилтгүй", 402);
  }
  if (!user) {
    throw new MyError(req.params.id, 401);
  }
  const token = await getToken();
  const response = await fetch("https://merchant.qpay.mn/v2/payment/check", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      object_type: "INVOICE",
      object_id: id,
      offset: {
        page_number: 1,
        page_limit: 100,
      },
    }),
  });
  const data = await response.json();
  const count = data.count;
  if (count === 0) {
    res.status(200).json({
      success: false,
      message: "Төлбөр төлөгдөөгүй",
    });
  } else {
    if (type === "lesson") {
      user.isPayment = true;
      user.save();
      res.status(200).json({ success: true });
    } else {
      user.isBoughtBook = true;
      user.save();
      res.status(200).json({ success: true });
    }
  }
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { password, cpassword } = req.body;
  const userId = req.params.id;
  const user = await User.findById(userId);
  if (password !== cpassword) {
    throw new MyError("Нууц үг тохирохгүй байна", 401);
  }
  user.password = password;

  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});
