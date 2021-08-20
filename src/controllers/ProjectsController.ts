import Project from "../models/Project";
import Prize from "../models/Prize";
import { bad, error } from "../util/error";
import { Request, Response } from "express";
import { getTartanHacks } from "./EventController";
import { findUserTeam } from "./TeamController";

export const createNewProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, url, slides, video, team } = req.body;

    const event = await getTartanHacks();

    const existingProjects = await Project.findOne({
      team: team,
      event: event._id,
    });

    if (existingProjects) {
      return bad(
        res,
        "You already have a project. Please edit or delete your existing project."
      );
    }

    if (!res.locals.user.admin) {
      const userTeam = await findUserTeam(res.locals.user._id);

      if (userTeam?._id !== team) {
        return bad(res, "You can only create projects for your team.");
      }
    }

    const project = new Project({
      name: name,
      description: description,
      event: event._id,
      url: url,
      slides: slides,
      video: video,
      team: team,
      prizes: [],
    });

    await project.save();

    const json = project.toJSON();
    res.json({
      ...json,
    });
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const editProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (id === null) {
    return bad(res, "Missing Project ID.");
  }

  try {
    await Project.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true },
      function (err, result) {
        if (err) {
          console.error(err);
          return error(res);
        }

        const json = result.toJSON();
        res.json({
          ...json,
        });
      }
    );
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const getProjectByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await Project.findById(id);

    res.json(result);
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const getAllProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await Project.find();

    res.status(200).json(result);
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const deleteProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (id === null) {
    return bad(res, "Missing Project ID.");
  }

  try {
    await Project.findByIdAndDelete(id);

    res.status(200).json({
      message: "Successfully deleted project.",
    });
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const getAllPrizes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await Prize.find();

    res.status(200).json(result);
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const getPrizeByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await Prize.findById(id);

    res.json(result);
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const createNewPrize = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, eligibility, provider } = req.body;

    const event = await getTartanHacks();

    const prize = new Prize({
      name: name,
      description: description,
      event: event._id,
      eligibility: eligibility,
      provider: provider,
    });

    await prize.save();

    const json = prize.toJSON();
    res.json({
      ...json,
    });
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const editPrize = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (id === null) {
    return bad(res, "Missing Prize ID.");
  }

  try {
    await Prize.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true },
      function (err, result) {
        if (err) {
          console.error(err);
          return error(res);
        }

        const json = result.toJSON();
        res.json({
          ...json,
        });
      }
    );
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const deletePrize = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (id === null) {
    return bad(res, "Missing Prize ID.");
  }

  try {
    await Prize.findByIdAndDelete(id);

    res.status(200).json({
      message: "Successfully deleted prize.",
    });
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};

export const enterProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { prizeID } = req.query;
  const { id } = req.params;

  if (id === null) {
    return bad(res, "Missing Project ID");
  }

  if (prizeID === null) {
    return bad(res, "Missing Prize ID");
  }

  try {
    const project = await Project.findById(id);
    const prize = await Prize.findById(prizeID);

    if (!project || !prize) {
      return bad(res, "Invalid Project or Prize ID");
    }

    project.prizes.push(prize._id);

    await project.save();
    const json = project.toJSON();
    res.json({
      ...json,
    });
  } catch (err) {
    if (err.name === "CastError" || err.name === "ValidationError") {
      return bad(res);
    } else {
      console.error(err);
      return error(res);
    }
  }
};