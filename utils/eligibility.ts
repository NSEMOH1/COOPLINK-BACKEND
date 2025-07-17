import { LoanName, LoanStatus, MemberType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { LoanApplication } from "../types";

const MIN_LOAN_AMOUNT = new Decimal(1000);
const CIVILIAN_MIN_SAVINGS = new Decimal(5000);
const CIVILIAN_MIN_SAVINGS_MONTHS = 6;
const MAX_LOAN_TO_SAVINGS_RATIO = new Decimal(2);
const ACCOUNT_MATURITY_DAYS = 90;

interface EligibilityCheckResult {
    eligible: boolean;
    errors: string[];
}

/**
 * Check if member has existing active loans
 */
export const checkExistingLoans = async (
    memberId: string,
    tx: any
): Promise<EligibilityCheckResult> => {
    const existingLoans = await tx.loan.findMany({
        where: {
            memberId,
            status: {
                in: [
                    LoanStatus.ACTIVE,
                    LoanStatus.PENDING,
                    LoanStatus.PENDING_VERIFICATION,
                    LoanStatus.APPROVED,
                ],
            },
        },
    });

    if (existingLoans.length > 0) {
        const statusMessages: Record<LoanStatus, string> = {
            [LoanStatus.ACTIVE]:
                "You currently have an active loan. Please complete repayment before applying for a new one.",
            [LoanStatus.PENDING]:
                "You have a pending loan application. Please wait for approval before applying for another.",
            [LoanStatus.PENDING_VERIFICATION]:
                "Your have an existing loan application being processed. Please wait for verification to complete.",
            [LoanStatus.APPROVED]:
                "You have an approved loan that hasn't been disbursed yet. Please wait for disbursement.",
            [LoanStatus.DISBURSED]:
                "You currently have an active loan. Please complete repayment before applying for a new one.",
            REJECTED: "",
            COMPLETED: "",
            DEFAULTED: "",
        };

        const priorityOrder: LoanStatus[] = [
            LoanStatus.ACTIVE,
            LoanStatus.APPROVED,
            LoanStatus.PENDING_VERIFICATION,
            LoanStatus.PENDING,
        ];

        const mostRelevantLoan = existingLoans.reduce(
            (prev: any, current: any) =>
                priorityOrder.indexOf(current.status) <
                priorityOrder.indexOf(prev.status)
                    ? current
                    : prev
        );
        if (mostRelevantLoan.status in statusMessages) {
            return {
                eligible: false,
                errors: [statusMessages[mostRelevantLoan.status as LoanStatus]],
            };
        }
    }

    return { eligible: true, errors: [] };
};

/**
 * Check basic loan amount requirements
 */
export const checkLoanAmount = (amount: Decimal): EligibilityCheckResult => {
    if (amount.lt(MIN_LOAN_AMOUNT)) {
        return {
            eligible: false,
            errors: [`Loan amount must be at least ${MIN_LOAN_AMOUNT}`],
        };
    }
    return { eligible: true, errors: [] };
};

/**
 * Check loan category validity
 */
export const checkLoanCategory = (
    categoryName: LoanName
): EligibilityCheckResult => {
    const validCategories = Object.values(LoanName);
    if (!validCategories.includes(categoryName)) {
        return {
            eligible: false,
            errors: [
                `Invalid loan category. Must be one of: ${validCategories.join(
                    ", "
                )}`,
            ],
        };
    }
    return { eligible: true, errors: [] };
};

/**
 * Check civilian member eligibility
 */
export const checkCivilianEligibility = (
    member: any,
    loanAmount: Decimal
): EligibilityCheckResult => {
    if (member.type !== MemberType.CIVILIAN) {
        return { eligible: true, errors: [] };
    }

    const errors: string[] = [];

    const accountAgeDays =
        (Date.now() - member.created_at.getTime()) / (1000 * 60 * 60 * 24);
    if (accountAgeDays < ACCOUNT_MATURITY_DAYS) {
        errors.push(
            `Account must be at least ${ACCOUNT_MATURITY_DAYS} days old`
        );
    }

    const savingsBalance = member.totalSavings ?? new Decimal(0);
    if (savingsBalance < CIVILIAN_MIN_SAVINGS.toNumber()) {
        errors.push(
            `Insufficient savings balance. Minimum required: ${CIVILIAN_MIN_SAVINGS}`
        );
    }

    const monthlySavings = new Map<string, Decimal>();
    member.transactions.forEach((transaction: any) => {
        const key = `${transaction.createdAt.getFullYear()}-${transaction.createdAt.getMonth()}`;
        const current = monthlySavings.get(key) ?? new Decimal(0);
        monthlySavings.set(key, current.add(transaction.amount));
    });

    if (monthlySavings.size < CIVILIAN_MIN_SAVINGS_MONTHS) {
        errors.push(
            `Insufficient savings history. Need at least ${CIVILIAN_MIN_SAVINGS_MONTHS} months of regular savings`
        );
    }

    const maxLoanAmount = savingsBalance * MAX_LOAN_TO_SAVINGS_RATIO.toNumber();
    if (loanAmount.gt(maxLoanAmount)) {
        errors.push(
            `Loan amount cannot exceed ${MAX_LOAN_TO_SAVINGS_RATIO}x your savings balance`
        );
    }

    return {
        eligible: errors.length === 0,
        errors,
    };
};

/**
 * Check personnel rank eligibility
 */
export const checkRankEligibility = async (
    member: any,
    loanAmount: Decimal,
    category: any,
    durationMonths: number,
    tx: any
): Promise<EligibilityCheckResult> => {
    if (member.type !== MemberType.PERSONEL || !member.Personel?.rank) {
        return { eligible: true, errors: [] };
    }
    if (category.name === LoanName.REGULAR) {
        const loanTerm = await tx.loanTerm.findFirst({
            where: {
                loanCategoryId: category.id,
                rankCompensation: { name: member.Personel.rank },
                durationMonths: durationMonths,
            },
        });

        if (!loanTerm) {
            return {
                eligible: false,
                errors: [
                    `No loan terms available for ${member.Personel.rank} rank at ${durationMonths} months`,
                ],
            };
        }

        if (loanAmount.gt(loanTerm.maximumAmount)) {
            return {
                eligible: false,
                errors: [
                    `Maximum amount for ${member.Personel.rank} rank at ${durationMonths} months is ₦${loanTerm.maximumAmount}`,
                ],
            };
        }
    } else {
        const eligibility = await tx.rankLoanEligibility.findFirst({
            where: {
                loanCategoryId: category.id,
                rankCompensation: { name: member.Personel.rank },
            },
        });

        if (!eligibility || loanAmount.lt(eligibility.minEligibleAmount)) {
            return {
                eligible: false,
                errors: [
                    `Minimum amount for ${member.Personel.rank} rank is ₦${
                        eligibility?.minEligibleAmount || "not configured"
                    }`,
                ],
            };
        }
    }

    return { eligible: true, errors: [] };
};

/**
 * Master eligibility checker
 */
export const checkLoanEligibility = async (
    member: any,
    application: LoanApplication,
    tx: any
): Promise<EligibilityCheckResult> => {
    const loanAmount = new Decimal(application.amount);
    const allErrors: string[] = [];

    const checks = [
        await checkExistingLoans(application.memberId, tx),
        checkLoanAmount(loanAmount),
        checkLoanCategory(application.category_name),
        checkCivilianEligibility(member, loanAmount),
    ];

    checks.forEach((check) => {
        if (!check.eligible) {
            allErrors.push(...check.errors);
        }
    });

    if (allErrors.length === 0) {
        const category = await tx.loanCategory.findUnique({
            where: { name: application.category_name },
        });

        if (category) {
            const rankCheck = await checkRankEligibility(
                member,
                loanAmount,
                category,
                application.durationMonths,
                tx
            );
            if (!rankCheck.eligible) {
                allErrors.push(...rankCheck.errors);
            }
        }
    }

    return {
        eligible: allErrors.length === 0,
        errors: allErrors,
    };
};
