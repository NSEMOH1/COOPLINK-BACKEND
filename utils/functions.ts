import { Rank, RepaymentStatus } from "@prisma/client";
import { prisma } from "../config/database";
import { Decimal } from "@prisma/client/runtime/library";

export const calculateRepayments = (
    amount: Decimal,
    annualInterestRate: number,
    durationMonths: number
) => {
    const principal = new Decimal(amount);
    const interestRate = new Decimal(annualInterestRate).div(100);

    const totalInterest = principal
        .mul(interestRate)
        .mul(new Decimal(durationMonths).div(12));

    const totalRepayment = principal.add(totalInterest);
    const monthlyPayment = totalRepayment
        .div(durationMonths)
        .toDecimalPlaces(2);

    return Array.from({ length: durationMonths }, (_, i) => ({
        amount: monthlyPayment,
        dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000),
        status: RepaymentStatus.PENDING,
    }));
};

export const calculateLoanEligibility = () => {};

export const generateOTP = (): string => {
    return Math.floor(10000 + Math.random() * 900000).toString();
};

export const verifyOTP = async (
    loanId: string,
    userOtp: string
): Promise<boolean> => {
    const loan = await prisma.loan.findUnique({
        where: { id: loanId },
        select: { otp: true, otpExpiresAt: true },
    });

    if (!loan || !loan.otp || !loan.otpExpiresAt) {
        return false;
    }

    const now = new Date();
    return loan.otp === userOtp && now < loan.otpExpiresAt;
};

export const generateSavingsReference = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SAV-${timestamp}-${random}`;
};

export const generateLoanReference = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `LN-${timestamp}-${random}`;
};

export const testLoanCalculations = () => {
    console.log("\n🧮 Testing loan calculations:");

    const testCases = [
        { amount: 650000, rate: 5, duration: 10 },
        { amount: 1000000, rate: 6, duration: 20 },
        { amount: 1100000, rate: 10, duration: 30 },
    ];

    testCases.forEach((test) => {
        const monthlyRate = test.rate / 100 / 12;
        const monthlyPayment =
            (test.amount *
                (monthlyRate * Math.pow(1 + monthlyRate, test.duration))) /
            (Math.pow(1 + monthlyRate, test.duration) - 1);

        const totalRepayment = monthlyPayment * test.duration;
        const totalInterest = totalRepayment - test.amount;

        console.log(
            `\nLoan: ₦${test.amount.toLocaleString()} @ ${test.rate}% for ${
                test.duration
            } months:`
        );
        console.log(
            `  Monthly Payment: ₦${Math.round(monthlyPayment).toLocaleString()}`
        );
        console.log(
            `  Total Repayment: ₦${Math.round(totalRepayment).toLocaleString()}`
        );
        console.log(
            `  Total Interest: ₦${Math.round(totalInterest).toLocaleString()}`
        );
    });
};

export const calculateProcessingTime = (
    startTime: Date,
    endTime: Date
): string => {
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    if (diffMins > 0) {
        return `${diffMins}:${diffSecs.toString().padStart(2, "0")} mins`;
    } else {
        return `${diffSecs} secs`;
    }
};
