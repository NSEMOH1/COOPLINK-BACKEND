import { prisma } from "../config/database";

interface ITermination {
    memberId: string;
    reason: string;
}
export const requestTermination = async (data: ITermination) => {
    if (!data.reason) throw new Error("Reason for termination is required");
    const result = await prisma.termination.create({
        data: {
            memberId: data.memberId,
            reason: data.reason,
        },
    });

    return result;
};

export const getAllTerminations = async () => {
    const result = await prisma.termination.findMany();
    if (!result) return { message: "No Termination Request found" };

    return result;
};
