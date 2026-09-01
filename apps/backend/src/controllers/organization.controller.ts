import { Request, Response } from "express";
import { createOrganizationService } from "../services/organization.service";

export const createOrganization = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        message: "Name and description are required",
      });
    }

    // @ts-ignore
    const adminId = req.userId;

    const org = await createOrganizationService({
      name,
      description,
      adminId,
    });

    return res.status(201).json({
      message: "Organization created successfully",
      organization: org,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};