import { prisma } from "../config/db.js";

const getInvitationByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        household: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    if (invitation.used) {
      return res.status(400).json({ error: "Invitation already used" });
    }

    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({ error: "Invitation expired" });
    }

    return res.status(200).json({
      status: "success",
      data: {
        invitation,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { getInvitationByToken };