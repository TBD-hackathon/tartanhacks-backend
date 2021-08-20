import express, { Router } from "express";
import {
  createNewProject,
  editProject,
  getProjectByID,
  getAllProjects,
  deleteProject,
  getAllPrizes,
  createNewPrize,
  editPrize,
  deletePrize,
  getPrizeByID,
  enterProject,
} from "../controllers/ProjectsController";
import { asyncCatch } from "../util/asyncCatch";
import { isAdmin, isAuthenticated, isProjectOwnerOrAdmin } from "./middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Projects Module
 *  description: Endpoints to manage dynamic projects.
 */

/**
 * @swagger
 * /projects/prizes:
 *   post:
 *     summary: Create new prize
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Projects Module]
 *     description: Creates new prize. Access - Admin.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               eligibility:
 *                 type: string
 *               provider:
 *                 type: string
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/prizes", isAdmin, asyncCatch(createNewPrize));

/**
 * @swagger
 * /projects/prizes/enter/{id}:
 *   put:
 *     summary: Enter a project for a prize
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Projects Module]
 *     description: Enters project for a prize. Access - User(Own)/Admin.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: query
 *         name: prizeID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.put(
  "/prizes/enter/:id",
  isProjectOwnerOrAdmin,
  asyncCatch(enterProject)
);

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create new project
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Projects Module]
 *     description: Creates new project. Access - Authenticated Users.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               team:
 *                 type: string
 *               slides:
 *                 type: string
 *               video:
 *                 type: string
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.post("/", isAuthenticated, asyncCatch(createNewProject));

/**
 * @swagger
 * /projects/prizes/{id}:
 *   patch:
 *     summary: Edit prize info
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Projects Module]
 *     description: Edit existing prize information. All body parameters are optional. If unspecified, the parameters are not updated. Access - Admin.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Prize ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               eligibility:
 *                 type: string
 *               provider:
 *                 type: string
 *               winner:
 *                 type: string
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.patch("/prizes/:id", isAdmin, asyncCatch(editPrize));

/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     summary: Edit project info
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Projects Module]
 *     description: Edit existing project information. All body parameters are optional. If unspecified, the parameters are not updated. Access - User(own)/Admin.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               slides:
 *                 type: string
 *               video:
 *                 type: string
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.patch("/:id", isProjectOwnerOrAdmin, asyncCatch(editProject));

/**
 * @swagger
 * /projects/prizes/{id}:
 *   get:
 *     summary: Get Prize by ID
 *     tags: [Projects Module]
 *     description: Get a single prize by iD. Access - Public.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Prize ID
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/prizes/:id", asyncCatch(getPrizeByID));

/**
 * @swagger
 * /projects/prizes:
 *   get:
 *     summary: Get Prizes
 *     tags: [Projects Module]
 *     description: Get all Prizes. Access - Public.
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/prizes", asyncCatch(getAllPrizes));

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get Project by ID
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Projects Module]
 *     description: Get a single project by iD. Access - User(own)/Admin.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/:id", isProjectOwnerOrAdmin, asyncCatch(getProjectByID));

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get Projects
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Projects Module]
 *     description: Get all Projects. Access - Admin.
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.get("/", isAdmin, asyncCatch(getAllProjects));

/**
 * @swagger
 * /projects/prizes/{id}:
 *   delete:
 *     summary: Delete prize by ID
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Projects Module]
 *     description: Delete prize by specifying ID. Access - Admin.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Prize ID
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.delete("/prizes/:id", isAdmin, asyncCatch(deletePrize));

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete project by ID
 *     security:
 *     - apiKeyAuth: []
 *     tags: [Projects Module]
 *     description: Delete project by specifying ID. Access - User(Own)/Admin.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     responses:
 *       200:
 *          description: Success.
 *       400:
 *          description: Bad request
 *       401:
 *          description: Unauthorized.
 *       500:
 *          description: Internal Server Error.
 */
router.delete("/:id", isProjectOwnerOrAdmin, asyncCatch(deleteProject));

export default router;