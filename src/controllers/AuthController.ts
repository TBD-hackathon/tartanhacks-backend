/**
 * Controller for auth routes
 */
import { Request, Response } from "express";
import User from "../models/User";
import { bad, error, notFound } from "../util/error";
import { getByToken } from "./UserController";
import { isRegistrationOpen } from "./SettingsController";
import * as EmailController from "./EmailController";
import * as StatusController from "./StatusController";
import Status from "src/models/Status";

/**
 * Register a user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const registrationOpen = await isRegistrationOpen();
  if (!registrationOpen) {
    return bad(res, "Registration is closed.");
  }

  if (!password || password.length < 6) {
    return bad(res, "Password must be 6 or more characters.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return bad(res, "An account with that email already exists!");
  }

  const hash = User.generateHash(password);
  const user = new User({ email, password: hash });
  await user.save();

  const token = await user.generateAuthToken();
  const json = user.toJSON();
  res.json({
    ...json,
    token,
  });

  const emailToken = await user.generateEmailVerificationToken();
  await EmailController.sendVerificationEmail(email, emailToken);
};

/**
 * Login a user with email and password or with a token in the header
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers["x-access-token"] as string;
  const { email, password } = req.body;

  if (token) {
    // Login with token
    try {
      const user = await getByToken(token);
      if (!user) {
        return bad(res, "Unknown account");
      }
      const json = user.toJSON();
      res.json({
        token,
        ...json,
      });
    } catch (err) {
      error(res, err);
    }
  } else {
    // Login with email & password
    if (!email || !password) {
      return bad(res, "Missing email or password");
    } else {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return notFound(res, "Unknown account");
        } else {
          if (!user.checkPassword(password)) {
            return bad(res, "Incorrect password");
          } else {
            // Return json of user without password hash
            const token = user.generateAuthToken();
            const json = user.toJSON();
            delete json.password;
            res.json({ ...json, token });
          }
        }
      } catch (err) {
        error(res, err);
      }
    }
  }
};

/**
 * Verify a user via email
 */
export const verify = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  if (token == null) {
    return bad(res, "Missing verification token");
  }

  try {
    const email = User.decryptEmailVerificationToken(token);
    if (email == null) {
      return bad(res, "Bad token");
    }

    const user = await User.findOne({ email });
    if (user == null) {
      return notFound(res, "User not found");
    }

    await StatusController.verifyUser(user._id);
    const json = user.toJSON();
    res.json({ ...json, token });
  } catch (err) {
    console.error(err);
    error(res, "An error occured");
  }
};

/**
 * Resend a user verification email
 */
export const resendVerificationEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;
  if (email == null) {
    return bad(res, "Missing email");
  }

  try {
    const user = await User.findOne({ email });
    if (user == null) {
      return notFound(res, "User not found");
    }

    const status = await StatusController.getStatus(user._id);
    if (status.verified) {
      return bad(res, "User is already verified!");
    }

    const emailToken = await user.generateEmailVerificationToken();
    await EmailController.sendVerificationEmail(email, emailToken);
    res.status(200).send();
  } catch (err) {
    console.error(err);
    error(res, "An error occured");
  }
};

/**
 * Reset a user's password with a password reset token
 */
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token, password } = req.body;
  if (token == null || password == null) {
    return bad(res, "Missing token or password");
  }

  try {
    const email = User.decryptPasswordResetToken(token);
    if (email == null) {
      return bad(res, "Bad token");
    }

    const hash = User.generateHash(password);
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          password: hash,
        },
      },
      {
        returnOriginal: false,
      }
    );
    if (user == null) {
      return notFound(res, "User not found");
    }

    const json = user.toJSON();
    res.json({ ...json, token });
  } catch (err) {
    console.error(err);
    error(res, "An error occured");
  }
};

/**
 * Send a password reset email
 */
export const sendPasswordResetEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;
  if (email == null) {
    return bad(res, "Missing email");
  }

  try {
    const user = await User.findOne({ email });
    if (user == null) {
      return notFound(res, "Unknown user");
    }

    const passwordResetToken = user.generatePasswordResetToken();
    await EmailController.sendPasswordResetEmail(email, passwordResetToken);
    res.status(200).send();
  } catch (err) {
    console.error(err);
    return error(res);
  }
};
