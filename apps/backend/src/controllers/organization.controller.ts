import { Request, Response } from "express";
import { addOrganizationMemberService, createOrganizationService, getOrganizationsService } from "../services/organization.service";

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

export const getOrganizations = async (
  req: Request,
  res: Response
) => {
  try {
    // @ts-ignore
    const userId = req.userId;

    const organizations = await getOrganizationsService(userId);

    return res.status(200).json({
      message: "Organizations fetched successfully",
      organizations,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const addOrganizationMember = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;
    const { email } = req.body;
    // @ts-ignore
    const adminId = req.userId;

    if (!organizationId || !email) {
      return res.status(400).json({
        message: "organizationId and email are required",
      });
    }

    const membership = await addOrganizationMemberService({
      organizationId: organizationId as string,
      adminId,
      email: email.trim().toLowerCase(),
    });

    return res.status(201).json({
      message: "User added to organization successfully",
      membership,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message === "Organization not found" || error.message === "User not found") {
        return res.status(404).json({ message: error.message });
      }

      if (
        error.message === "Only organization admins can add members" ||
        error.message === "User is already a member of this organization"
      ) {
        return res.status(409).json({ message: error.message });
      }
    }

    return res.status(500).json({
      message: "Failed to add organization member",
    });
  }
};