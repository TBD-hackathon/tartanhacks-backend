import { NextFunction, Request, Response } from "express";
import { getByToken } from "../controllers/UserController";
import { bad, error, unauthorized } from "../util/error";
import CheckinItem from "src/models/CheckinItem";

/**
 * Middleware to check if a user is logged in and authenticated.
 * Errors with 403 otherwise
 */
export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers["x-access-token"] as string;
  if (!token) {
    return unauthorized(res);
  }
  try {
    const user = await getByToken(token);
    if (!user) {
      unauthorized(res);
    } else {
      res.locals.user = user;
      return next();
    }
  } catch (err) {
    return error(res, err);
  }
};

/**
 * Middleware to check if a user is an admin.
 * Continues if the user is an admin. Otherwise, errors with 403
 */
export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers["x-access-token"] as string;
  if (!token) {
    return unauthorized(res);
  }
  try {
    const user = await getByToken(token);
    if (user?.admin) {
      res.locals.user = user;
      return next();
    } else {
      unauthorized(res);
    }
  } catch (err) {
    return error(res, err);
  }
};

/**
 * Middleware to check if a user is an admin or the owner (based on the param ID)
 * Continues if the user is the owner or an admin. Otherwise, errors with 403
 */
export const isOwnerOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers["x-access-token"] as string;
  if (!token) {
    return unauthorized(res);
  }
  const { id } = req.params;
  if (!id) {
    return bad(res);
  }

  try {
    const user = await getByToken(token);
    if (user?.admin || user._id.toString() === id) {
      res.locals.user = user;
      return next();
    } else {
      unauthorized(res);
    }
  } catch (err) {
    return error(res, err);
  }
};

export const canCheckIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers["x-access-token"] as string;
  if (!token) {
    return unauthorized(res);
  }
  const checkInItemID = req.query.checkInItemID;
  const userID = req.query.userID;

  if (!checkInItemID || !userID) {
    return bad(res);
  }

  try {
    const user = await getByToken(token);
    const checkInItem = await CheckinItem.findById(checkInItemID);

    if (
      user?.admin ||
      (checkInItem?.enableSelfCheckin && user._id.toString() === userID)
    ) {
      res.locals.user = user;
      return next();
    } else {
      unauthorized(res);
    }
  } catch (err) {
    return error(res, err);
  }
};
