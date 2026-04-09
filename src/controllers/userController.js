// Set default household for user
const setDefaultHousehold = async (req, res) => {
    const userId = req.user.id;
    let { householdId } = req.body;

    // If no householdId provided, auto-select if only one membership
    if (!householdId) {
        const memberships = await prisma.householdMember.findMany({
            where: { userId },
            select: { householdId: true }
        });
        if (memberships.length === 1) {
            householdId = memberships[0].householdId;
        } else {
            return res.status(400).json({ error: "householdId required unless only one membership exists" });
        }
    }

    // Validate membership
    const membership = await prisma.householdMember.findFirst({
        where: { userId, householdId }
    });
    if (!membership) {
        return res.status(403).json({ error: "User is not a member of this household" });
    }

    // Update user
    await prisma.user.update({
        where: { id: userId },
        data: { defaultHouseholdId: householdId }
    });
    res.json({ status: "success", defaultHouseholdId: householdId });
};
import { prisma } from "../config/db.js"

const getUser = (prisma) => async (req, res) => {
    const { id } = req.params

    // users can only fetch their own profile for now
    if (id !== req.user.id) {
        return res.status(403).json({ error: "Not allowed to view this user" })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                memberships: true,
                taskAssignments: true,
                choresCreated: true
            }
        })

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

                // Remove sensitive/unwanted fields
                function cleanUser(u, membershipsWithNames) {
                    if (!u) return u;
                    const { password, defaultHouseholdId, memberships, ...rest } = u;
                    // Use provided membershipsWithNames if available
                    return { ...rest, memberships: membershipsWithNames || memberships };
                }

                // If only one membership and no defaultHousehold, set it automatically
                if (
                    user &&
                    Array.isArray(user.memberships) &&
                    user.memberships.length === 1 &&
                    !user.defaultHousehold
                ) {
                    const onlyMembership = user.memberships[0];
                    if (onlyMembership && onlyMembership.householdId) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { defaultHouseholdId: onlyMembership.householdId }
                        });
                        // Refetch user with defaultHousehold
                        const updatedUser = await prisma.user.findUnique({
                            where: { id: user.id },
                            include: {
                                defaultHousehold: { select: { id: true, name: true } },
                                memberships: true,
                                taskAssignments: true,
                                choresCreated: true
                            }
                        });
                        return res.json({ status: "success", data: { user: cleanUser(updatedUser) } });
                    }
                }

                // If only one membership and no defaultHousehold, fetch and return it as defaultHousehold
                if (
                    user &&
                    Array.isArray(user.memberships) &&
                    user.memberships.length === 1 &&
                    !user.defaultHousehold
                ) {
                    const onlyMembership = user.memberships[0];
                    if (onlyMembership && onlyMembership.householdId) {
                        // Fetch the household object
                        const household = await prisma.household.findUnique({
                            where: { id: onlyMembership.householdId },
                            select: { id: true, name: true }
                        });
                        const cleaned = cleanUser(user);
                        cleaned.defaultHousehold = household;
                        return res.json({ status: "success", data: { user: cleaned } });
                    }
                }
                res.json({ status: "success", data: { user: cleanUser(user) } })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

const getMe = async (req, res) => {
    function formatUserTaskAssignments(taskAssignments) {
        return (taskAssignments || []).map((task) => ({
            id: task.id,
            eventId: task.eventId,
            assignedToUserId: task.assignedToId,
            roomName: task.room?.name || null,
            room: task.room,
            chore: task.chore,
            date: task.date,
            status: task.status,
            completedAt: task.completedAt,
        }));
    }

    function cleanUser(u, membershipsWithNames) {
        if (!u) return u;
        const { password, defaultHouseholdId, memberships, ...rest } = u;
        // Use provided membershipsWithNames if available
        return {
            ...rest,
            memberships: membershipsWithNames || memberships,
            taskAssignments: formatUserTaskAssignments(rest.taskAssignments),
        };
    }

    function formatCleaningEvents(events, memberships) {
        const membershipByHouseholdAndUser = new Map(
            memberships.map((membership) => [
                `${membership.householdId}:${membership.userId}`,
                membership.id,
            ])
        );

        return events.map((event) => ({
            id: event.id,
            name: event.name,
            eventDate: event.eventDate,
            status: event.status,
            householdId: event.householdId,
            createdByUserId: event.createdByUserId,
            createdAt: event.createdAt,
            participants: (event.participants || [])
                .map((participant) => membershipByHouseholdAndUser.get(`${event.householdId}:${participant.userId}`))
                .filter(Boolean),
            taskAssignments: (event.tasks || []).map((task) => ({
                id: task.id,
                assignedToUserId: task.assignedToId,
                roomName: task.room?.name || null,
                room: task.room,
                chore: task.chore,
                date: task.date,
                status: task.status,
                completedAt: task.completedAt,
            })),
        }));
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                defaultHousehold: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                memberships: {
                    include: {
                        household: { select: { name: true } }
                    }
                },
                taskAssignments: {
                    select: {
                        id: true,
                        eventId: true,
                        assignedToId: true,
                        date: true,
                        status: true,
                        completedAt: true,
                        room: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        chore: {
                            select: {
                                id: true,
                                title: true,
                                points: true,
                                roomId: true,
                                householdId: true,
                            },
                        },
                    },
                },
                choresCreated: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Fetch cleaning events where user is assigned to any task and event belongs to defaultHousehold
        let resolvedDefaultHousehold = user.defaultHousehold;
        // Prepare memberships array with household name
        const membershipsWithNames = Array.isArray(user.memberships)
            ? user.memberships.map(m => ({
                id: m.id,
                userId: m.userId,
                householdId: m.householdId,
                role: m.role,
                householdName: m.household?.name || null
            }))
            : [];

        // If no defaultHousehold, set it as the newest household in memberships (by createdAt)
        if (
            user &&
            Array.isArray(user.memberships) &&
            !user.defaultHousehold &&
            user.memberships.length > 0
        ) {
            // Find newest membership by createdAt (descending)
            const newestMembership = user.memberships.reduce((latest, curr) => {
                if (!latest) return curr;
                if (!curr.createdAt) return latest;
                if (!latest.createdAt) return curr;
                return new Date(curr.createdAt) > new Date(latest.createdAt) ? curr : latest;
            }, null);
            if (newestMembership && newestMembership.householdId) {
                // Fetch the household object
                const household = await prisma.household.findUnique({
                    where: { id: newestMembership.householdId },
                    select: { id: true, name: true }
                });
                resolvedDefaultHousehold = household;
                const cleaned = cleanUser(user, membershipsWithNames);
                cleaned.defaultHousehold = household;
                // Filter cleaning events using resolvedDefaultHousehold
                let cleaningEvents = [];
                if (resolvedDefaultHousehold && resolvedDefaultHousehold.id) {
                    cleaningEvents = await prisma.cleaningEvent.findMany({
                        where: {
                            householdId: resolvedDefaultHousehold.id,
                        },
                        select: {
                            id: true,
                            name: true,
                            eventDate: true,
                            status: true,
                            householdId: true,
                            createdByUserId: true,
                            createdAt: true,
                            participants: {
                                select: {
                                    userId: true,
                                },
                            },
                            tasks: {
                                select: {
                                    id: true,
                                    roomId: true,
                                    assignedToId: true,
                                    date: true,
                                    status: true,
                                    completedAt: true,
                                    room: {
                                        select: {
                                            id: true,
                                            name: true,
                                        },
                                    },
                                    chore: {
                                        select: {
                                            id: true,
                                            title: true,
                                            points: true,
                                            roomId: true,
                                            householdId: true,
                                        },
                                    },
                                },
                            },
                        },
                        orderBy: { eventDate: "desc" }
                    });
                }
                cleaned.cleaningEvents = formatCleaningEvents(cleaningEvents, user.memberships || []);
                return res.json({ status: "success", data: { user: cleaned } });
            }
        }

        // Filter cleaning events using resolvedDefaultHousehold
        let cleaningEvents = [];
        if (resolvedDefaultHousehold && resolvedDefaultHousehold.id) {
            cleaningEvents = await prisma.cleaningEvent.findMany({
                where: {
                    householdId: resolvedDefaultHousehold.id,
                },
                select: {
                    id: true,
                    name: true,
                    eventDate: true,
                    status: true,
                    householdId: true,
                    createdByUserId: true,
                    createdAt: true,
                    participants: {
                        select: {
                            userId: true,
                        },
                    },
                    tasks: {
                        select: {
                            id: true,
                            roomId: true,
                            assignedToId: true,
                            date: true,
                            status: true,
                            completedAt: true,
                            room: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            chore: {
                                select: {
                                    id: true,
                                    title: true,
                                    points: true,
                                    roomId: true,
                                    householdId: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { eventDate: "desc" }
            });
        }

        // If only one membership and no defaultHousehold, fetch and return it as defaultHousehold
        if (
            user &&
            Array.isArray(user.memberships) &&
            user.memberships.length === 1 &&
            !user.defaultHousehold
        ) {
            const onlyMembership = user.memberships[0];
            if (onlyMembership && onlyMembership.householdId) {
                // Fetch the household object
                const household = await prisma.household.findUnique({
                    where: { id: onlyMembership.householdId },
                    select: { id: true, name: true }
                });
                const cleaned = cleanUser(user);
                cleaned.defaultHousehold = household;
                cleaned.cleaningEvents = formatCleaningEvents(cleaningEvents, user.memberships || []);
                return res.json({ status: "success", data: { user: cleaned } });
            }
        }

        const cleanedUser = cleanUser(user, membershipsWithNames);
        cleanedUser.cleaningEvents = formatCleaningEvents(cleaningEvents, user.memberships || []);
        res.json({ status: "success", data: { user: cleanedUser } });
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        })

        res.json({ status: "success", data: { users } })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

const updateUser = async (req, res) => {
    const { id } = req.params
    const { name } = req.body

    const targetUser = await prisma.user.findUnique({ where: { id } })

    if (!targetUser) {
        return res.status(404).json({ error: "User not found" })
    }

    if (targetUser.id !== req.user.id) {
        return res.status(403).json({ error: "Not allowed to update this user" })
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name: name || undefined
            }
        })

        res.json({ 
            status: "success", 
            data: { 
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: updatedUser.name
                }
            }
        })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params

    if (id !== req.user.id) {
        return res.status(403).json({ error: "Not allowed to delete this user" })
    }

    try {
        await prisma.user.delete({ where: { id } })
        res.json({ status: "success", message: "User deleted successfully" })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

  const listHouseholds = async (req, res) => {
    try {
      const userId = req.user.id
      const households = await prisma.householdMember.findMany({
        where: { userId },
        select: {
          household: true,
          role: true
        }
      })
      res.json(households)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Server error' })
    }
  }

export { getUser, getAllUsers, listHouseholds, updateUser, deleteUser, getMe, setDefaultHousehold }
