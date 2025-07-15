import { Decimal } from "@prisma/client/runtime/library";
import { LoanApplication } from "../types";
import { LoanName, MemberType } from "@prisma/client";

/**
 * Calculate loan terms based on category and member details
 */

interface LoanTerms {
    interestRate: Decimal;
    category: any;
    maxAmount?: Decimal;
}
export const calculateLoanTerms = async (
    member: any,
    application: LoanApplication,
    tx: any
): Promise<LoanTerms> => {
    const loanAmount = new Decimal(application.amount);

    const category = await tx.loanCategory.findUnique({
        where: { name: application.category_name },
        include: {
            regularLoanTerms:
                application.category_name === LoanName.REGULAR
                    ? {
                          where: {
                              durationMonths: application.durationMonths,
                              ...(member.type === MemberType.PERSONEL &&
                                  member.Personel?.rank && {
                                      rankCompensation: {
                                          name: member.Personel.rank,
                                      },
                                  }),
                          },
                      }
                    : false,
        },
    });

    if (!category || !category.isActive) {
        throw new Error("Requested loan product is not available");
    }

    let interestRate: Decimal;

    if (application.category_name === LoanName.REGULAR) {
        if (!member.Personel?.rank) {
            throw new Error("Rank information is required for regular loans");
        }

        const regularLoanTerm = await tx.loanTerm.findFirst({
            where: {
                durationMonths: application.durationMonths,
                rankCompensation: {
                    name: member.Personel.rank,
                },
                loanCategory: {
                    name: LoanName.REGULAR,
                },
            },
        });

        if (!regularLoanTerm) {
            throw new Error(
                `No loan terms available for ${member.Personel.rank} rank and ${application.durationMonths} months duration`
            );
        }

        const maxAllowed = regularLoanTerm.maximumAmount;
        if (loanAmount.gt(maxAllowed)) {
            throw new Error(
                `Maximum amount for ${member.Personel.rank} rank at ${application.durationMonths} months is ${maxAllowed}`
            );
        }

        interestRate = regularLoanTerm.interestRate;
    } else {
        interestRate = category.interestRate ?? new Decimal(0);
        const minAmount = category.minAmount ?? new Decimal(0);
        const maxAmount = category.maxAmount ?? new Decimal(Infinity);

        if (loanAmount.lt(minAmount) || loanAmount.gt(maxAmount)) {
            throw new Error(
                `Amount must be between ${minAmount} and ${maxAmount}`
            );
        }

        if (category.minDuration && category.maxDuration) {
            const durationDays = application.durationMonths * 30;
            if (
                durationDays < category.minDuration ||
                durationDays > category.maxDuration
            ) {
                throw new Error(
                    `Duration must be between ${category.minDuration} and ${category.maxDuration} days`
                );
            }
        }
    }

    return {
        interestRate,
        category,
        maxAmount: category.maxAmount,
    };
};
