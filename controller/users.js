import User from "../models/User.js";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import axios from "axios";
import Wallet from "../models/Wallet.js";
import { format, startOfDay } from "date-fns";
import bcrypt from "bcrypt";
import Voucher from "../models/Voucher.js";
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

export const invoiceTime = asyncHandler(async (req, res, next) => {
  const profile = await User.findById(req.params.id);
  await axios({
    method: "post",
    url: "https://merchant.qpay.mn/v2/auth/token",
    headers: {
      Authorization: `Basic Qk9PU1RFUlNfTU46UzhFZ1ROM2Y=`,
    },
  })
    .then((response) => {
      const token = response.data.access_token;

      axios({
        method: "post",
        url: "https://merchant.qpay.mn/v2/invoice",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          invoice_code: "BOOSTERS_MN_INVOICE",
          sender_invoice_no: "12345678",
          invoice_receiver_code: `${profile.phone}`,
          invoice_description: `Booster charge ${profile.phone}`,

          amount: req.body.amount,
          callback_url: `https://www.boostersback.com/api/v1/users/callbacks/${req.params.id}/${req.body.amount}`,
        },
      })
        .then(async (response) => {
          req.body.urls = response.data.urls;
          req.body.qrImage = response.data.qr_image;
          req.body.invoiceId = response.data.invoice_id;
          const wallet = await Wallet.create(req.body);
          profile.invoiceId = wallet._id;
          profile.save();
          res.status(200).json({
            success: true,
            data: wallet,
          });
        })
        .catch((error) => {
          console.log(error.response.data);
        });
    })
    .catch((error) => {
      console.log(error.response.data);
    });
});

export const invoiceCheck = asyncHandler(async (req, res) => {
  await axios({
    method: "post",
    url: "https://merchant.qpay.mn/v2/auth/token",
    headers: {
      Authorization: `Basic Qk9PU1RFUlNfTU46UzhFZ1ROM2Y=`,
    },
  })
    .then((response) => {
      const token = response.data.access_token;
      axios({
        method: "post",
        url: "https://merchant.qpay.mn/v2/payment/check",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          object_type: "INVOICE",
          object_id: req.params.id,
          page_number: 1,
          page_limit: 100,
          callback_url: `https://www.boostersback.com/api/v1/users/check/challbacks/${req.params.id}/${req.params.numId}`,
        },
      })
        .then(async (response) => {
          const profile = await User.findById(req.params.numId);
          const count = response.data.count;
          if (count === 0) {
            res.status(401).json({
              success: false,
            });
          } else {
            profile.isPayment = true;
            profile.paymentDate = new Date();
            profile.save();
            res.status(200).json({
              success: true,
              data: profile,
            });
          }
        })
        .catch((error) => {
          // console.log(error, "error");
          console.log("err==================");
        });
    })
    .catch((error) => {
      console.log(error);
    });
});

export const chargeTime = asyncHandler(async (req, res, next) => {
  const profile = await User.findById(req.params.id);
  profile.isPayment = true;
  profile.paymentDate = new Date();
  profile.save();
  res.status(200).json({
    success: true,
    data: profile,
  });
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

export const userVoucherActive = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const user = await User.findById(req.userId);
  const voucher = await Voucher.findOne({ code: code });
  if (!voucher) {
    throw new MyError("Буруу код", 404);
  }
  if (!user) {
    throw new MyError("Эхлээд нэвтрэнэ үү", 404);
  }
  if (user.isPayment) {
    throw new MyError("Танд эрх бна", 404);
  }
  if (voucher.active) {
    throw new MyError("Оруулсан код", 404);
  }
  user.isPayment = true;
  user.gifted = true;
  user.voucher = voucher._id;
  user.paymentDate = new Date();
  user.activeAt = new Date();
  voucher.active = true;
  user.save();
  voucher.save();
  res.status(200).json({
    data: user,
    success: true,
  });
});
