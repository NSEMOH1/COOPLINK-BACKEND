import { LoanName, PrismaClient, Rank } from "@prisma/client";
import { testLoanCalculations } from "../utils/functions";
const prisma = new PrismaClient();

async function seedDatabase() {
    await prisma.loanCategory.createMany({
        data: [
            {
                name: LoanName.EMERGENCY,
                description: "Quick funds needed for emergency cases",
                interestRate: 10,
                minAmount: 50000,
                maxAmount: 500000,
                minDuration: 30,
                maxDuration: 90,
            },
            {
                name: LoanName.HOME,
                description: "Quick funds needed for home appliances",
                interestRate: 5,
                minAmount: 50000,
                maxAmount: 500000,
                minDuration: 30,
                maxDuration: 90,
            },
            {
                name: LoanName.COMMODITY,
                description: "Quick funds needed for needed commodity",
                interestRate: 0,
                minAmount: 50000,
                maxAmount: 500000,
                minDuration: 30,
                maxDuration: 90,
            },
            {
                name: LoanName.HOUSING,
                description: "Quick funds needed for house rents",
                interestRate: 5,
                minAmount: 50000,
                maxAmount: 500000,
                minDuration: 30,
                maxDuration: 90,
            },
            // REGULAR (no fixed terms)
            {
                name: LoanName.REGULAR,
                interestRate: null,
                minAmount: null,
                maxAmount: null,
                minDuration: null,
                maxDuration: null,
            },
        ],
    });

    // 2. Create Ranks with their terms
    const ranks = [
        {
            name: Rank.ACM,
            minimumSaving: 5000,
            maxLoanDeduction: 72967,
            lowestSalaryRange: 104238.56,
            regularLoanTerms: [
                { duration: 10, maxAmount: 650000, interestRate: 5.0 },
                { duration: 20, maxAmount: 1000000, interestRate: 6.0 },
                { duration: 30, maxAmount: 1100000, interestRate: 10.0 },
            ],
            eligibleCategories: [
                { categoryName: LoanName.HOME, minEligibleAmount: 500000 },
                { categoryName: LoanName.COMMODITY, minEligibleAmount: 500000 },
                { categoryName: LoanName.HOUSING, minEligibleAmount: 500000 },
                { categoryName: LoanName.EMERGENCY, minEligibleAmount: 500000 },
            ],
        },
        {
            name: Rank.LCPL,
            minimumSaving: 5000,
            maxLoanDeduction: 78181.31,
            lowestSalaryRange: 111687.58,
            regularLoanTerms: [
                { duration: 10, maxAmount: 700000, interestRate: 5.0 },
                { duration: 20, maxAmount: 1100000, interestRate: 6.0 },
                { duration: 30, maxAmount: 1300000, interestRate: 10.0 },
            ],
            eligibleCategories: [
                { categoryName: LoanName.HOME, minEligibleAmount: 500000 },
                { categoryName: LoanName.COMMODITY, minEligibleAmount: 500000 },
                { categoryName: LoanName.HOUSING, minEligibleAmount: 500000 },
                { categoryName: LoanName.EMERGENCY, minEligibleAmount: 500000 },
            ],
        },
        {
            name: Rank.CPL,
            minimumSaving: 5000,
            maxLoanDeduction: 79816.98,
            lowestSalaryRange: 114024.25,
            regularLoanTerms: [
                { duration: 10, maxAmount: 720000, interestRate: 5.0 },
                { duration: 20, maxAmount: 1200000, interestRate: 6.0 },
                { duration: 30, maxAmount: 1500000, interestRate: 10.0 },
            ],
            eligibleCategories: [
                { categoryName: LoanName.HOME, minEligibleAmount: 500000 },
                { categoryName: LoanName.COMMODITY, minEligibleAmount: 500000 },
                { categoryName: LoanName.HOUSING, minEligibleAmount: 500000 },
                { categoryName: LoanName.EMERGENCY, minEligibleAmount: 500000 },
            ],
        },
        {
            name: Rank.SGT,
            minimumSaving: 5000,
            maxLoanDeduction: 94719.98,
            lowestSalaryRange: 135314.25,
            regularLoanTerms: [
                { duration: 10, maxAmount: 850000, interestRate: 5.0 },
                { duration: 20, maxAmount: 1500000, interestRate: 6.0 },
                { duration: 30, maxAmount: 1800000, interestRate: 10.0 },
            ],
            eligibleCategories: [
                { categoryName: LoanName.HOME, minEligibleAmount: 500000 },
                { categoryName: LoanName.COMMODITY, minEligibleAmount: 500000 },
                { categoryName: LoanName.HOUSING, minEligibleAmount: 500000 },
                { categoryName: LoanName.EMERGENCY, minEligibleAmount: 500000 },
            ],
        },
        {
            name: Rank.FS,
            minimumSaving: 5000,
            maxLoanDeduction: 101316.48,
            lowestSalaryRange: 144737.83,
            regularLoanTerms: [
                { duration: 10, maxAmount: 900000, interestRate: 5.0 },
                { duration: 20, maxAmount: 1600000, interestRate: 6.0 },
                { duration: 30, maxAmount: 2000000, interestRate: 10.0 },
            ],
            eligibleCategories: [
                { categoryName: LoanName.HOME, minEligibleAmount: 500000 },
                { categoryName: LoanName.COMMODITY, minEligibleAmount: 500000 },
                { categoryName: LoanName.HOUSING, minEligibleAmount: 500000 },
                { categoryName: LoanName.EMERGENCY, minEligibleAmount: 500000 },
            ],
        },
        {
            name: Rank.WO,
            minimumSaving: 5000,
            maxLoanDeduction: 113700.3,
            lowestSalaryRange: 162429,
            regularLoanTerms: [
                { duration: 10, maxAmount: 1000000, interestRate: 5.0 },
                { duration: 20, maxAmount: 2000000, interestRate: 6.0 },
                { duration: 30, maxAmount: 2200000, interestRate: 10.0 },
            ],
            eligibleCategories: [
                { categoryName: LoanName.HOME, minEligibleAmount: 500000 },
                { categoryName: LoanName.COMMODITY, minEligibleAmount: 500000 },
                { categoryName: LoanName.HOUSING, minEligibleAmount: 500000 },
                { categoryName: LoanName.EMERGENCY, minEligibleAmount: 500000 },
            ],
        },
        {
            name: Rank.MWO,
            minimumSaving: 5000,
            maxLoanDeduction: 170928.63,
            lowestSalaryRange: 244183.75,
            regularLoanTerms: [
                { duration: 10, maxAmount: 1500000, interestRate: 5.0 },
                { duration: 20, maxAmount: 3000000, interestRate: 6.0 },
                { duration: 30, maxAmount: 4000000, interestRate: 10.0 },
            ],
            eligibleCategories: [
                { categoryName: LoanName.HOME, minEligibleAmount: 500000 },
                { categoryName: LoanName.COMMODITY, minEligibleAmount: 500000 },
                { categoryName: LoanName.HOUSING, minEligibleAmount: 500000 },
                { categoryName: LoanName.EMERGENCY, minEligibleAmount: 500000 },
            ],
        },
        {
            name: Rank.AWO,
            minimumSaving: 5000,
            maxLoanDeduction: 184331.93,
            lowestSalaryRange: 263331.33,
            regularLoanTerms: [
                { duration: 10, maxAmount: 1700000, interestRate: 5.0 },
                { duration: 20, maxAmount: 3400000, interestRate: 6.0 },
                { duration: 30, maxAmount: 4500000, interestRate: 10.0 },
            ],
            eligibleCategories: [
                { categoryName: LoanName.HOME, minEligibleAmount: 500000 },
                { categoryName: LoanName.COMMODITY, minEligibleAmount: 500000 },
                { categoryName: LoanName.HOUSING, minEligibleAmount: 500000 },
                { categoryName: LoanName.EMERGENCY, minEligibleAmount: 500000 },
            ],
        },
        {
            name: Rank.PLT_OFFR,
            minimumSaving: 5000,
            maxLoanDeduction: 185571.56,
            lowestSalaryRange: 265103.08,
            regularLoanTerms: [
                { duration: 10, maxAmount: 1700000, interestRate: 5.0 },
                { duration: 20, maxAmount: 3500000, interestRate: 6.0 },
                { duration: 30, maxAmount: 4500000, interestRate: 10.0 },
            ],
            eligibleCategories: [
                { categoryName: LoanName.HOME, minEligibleAmount: 500000 },
                { categoryName: LoanName.COMMODITY, minEligibleAmount: 500000 },
                { categoryName: LoanName.HOUSING, minEligibleAmount: 500000 },
                { categoryName: LoanName.EMERGENCY, minEligibleAmount: 500000 },
            ],
        },
        {
            name: Rank.FG_OFFR,
            minimumSaving: 5000,
            maxLoanDeduction: 199073.23,
            lowestSalaryRange: 284390.33,
            regularLoanTerms: [
                { duration: 10, maxAmount: 1800000, interestRate: 5.0 },
                { duration: 20, maxAmount: 4000000, interestRate: 6.0 },
                { duration: 30, maxAmount: 5000000, interestRate: 10.0 },
            ],
            eligibleCategories: [
                { categoryName: LoanName.HOME, minEligibleAmount: 500000 },
                { categoryName: LoanName.COMMODITY, minEligibleAmount: 500000 },
                { categoryName: LoanName.HOUSING, minEligibleAmount: 500000 },
                { categoryName: LoanName.EMERGENCY, minEligibleAmount: 500000 },
            ],
        },
        {
            name: Rank.FLT_LT,
            minimumSaving: 5000,
            maxLoanDeduction: 231202.59,
            lowestSalaryRange: 330289.42,
            regularLoanTerms: [
                { duration: 10, maxAmount: 2000000, interestRate: 5.0 },
                { duration: 20, maxAmount: 4500000, interestRate: 6.0 },
                { duration: 30, maxAmount: 6000000, interestRate: 10.0 },
            ],
            eligibleCategories: [
                { categoryName: LoanName.HOME, minEligibleAmount: 500000 },
                { categoryName: LoanName.COMMODITY, minEligibleAmount: 500000 },
                { categoryName: LoanName.HOUSING, minEligibleAmount: 500000 },
                { categoryName: LoanName.EMERGENCY, minEligibleAmount: 500000 },
            ],
        },
        {
            name: Rank.SQN_LDR,
            minimumSaving: 5000,
            maxLoanDeduction: 244703.84,
            lowestSalaryRange: 349576.92,
            regularLoanTerms: [
                { duration: 10, maxAmount: 2300000, interestRate: 5.0 },
                { duration: 20, maxAmount: 5000000, interestRate: 6.0 },
                { duration: 30, maxAmount: 6500000, interestRate: 10.0 },
            ],
            eligibleCategories: [
                { categoryName: LoanName.HOME, minEligibleAmount: 500000 },
                { categoryName: LoanName.COMMODITY, minEligibleAmount: 500000 },
                { categoryName: LoanName.HOUSING, minEligibleAmount: 500000 },
                { categoryName: LoanName.EMERGENCY, minEligibleAmount: 500000 },
            ],
        },
        {
            name: Rank.WG_CDR,
            minimumSaving: 5000,
            maxLoanDeduction: 280197.17,
            lowestSalaryRange: 400281.67,
            regularLoanTerms: [
                { duration: 10, maxAmount: 2600000, interestRate: 5.0 },
                { duration: 20, maxAmount: 5500000, interestRate: 6.0 },
                { duration: 30, maxAmount: 7000000, interestRate: 10.0 },
            ],
            eligibleCategories: [
                { categoryName: LoanName.HOME, minEligibleAmount: 500000 },
                { categoryName: LoanName.COMMODITY, minEligibleAmount: 500000 },
                { categoryName: LoanName.HOUSING, minEligibleAmount: 500000 },
                { categoryName: LoanName.EMERGENCY, minEligibleAmount: 500000 },
            ],
        },
        {
            name: Rank.GP_CAPT,
            minimumSaving: 5000,
            maxLoanDeduction: 327702.32,
            lowestSalaryRange: 468146.17,
            regularLoanTerms: [
                { duration: 10, maxAmount: 3000000, interestRate: 5.0 },
                { duration: 20, maxAmount: 6000000, interestRate: 6.0 },
                { duration: 30, maxAmount: 7500000, interestRate: 10.0 },
            ],
            eligibleCategories: [
                { categoryName: LoanName.HOME, minEligibleAmount: 500000 },
                { categoryName: LoanName.COMMODITY, minEligibleAmount: 500000 },
                { categoryName: LoanName.HOUSING, minEligibleAmount: 500000 },
                { categoryName: LoanName.EMERGENCY, minEligibleAmount: 500000 },
            ],
        },
        {
            name: Rank.AIR_CDRE,
            minimumSaving: 5000,
            maxLoanDeduction: 622136.38,
            lowestSalaryRange: 888766.25,
            regularLoanTerms: [
                { duration: 10, maxAmount: 6000000, interestRate: 5.0 },
                { duration: 20, maxAmount: 10000000, interestRate: 6.0 },
                { duration: 30, maxAmount: 12000000, interestRate: 10.0 },
            ],
            eligibleCategories: [
                { categoryName: LoanName.HOME, minEligibleAmount: 500000 },
                { categoryName: LoanName.COMMODITY, minEligibleAmount: 500000 },
                { categoryName: LoanName.HOUSING, minEligibleAmount: 500000 },
                { categoryName: LoanName.EMERGENCY, minEligibleAmount: 500000 },
            ],
        },
        {
            name: Rank.AVM,
            minimumSaving: 5000,
            maxLoanDeduction: 1000271.79,
            lowestSalaryRange: 1343245.42,
            regularLoanTerms: [
                { duration: 10, maxAmount: 9000000, interestRate: 5.0 },
                { duration: 20, maxAmount: 15000000, interestRate: 6.0 },
                { duration: 30, maxAmount: 20000000, interestRate: 10.0 },
            ],
            eligibleCategories: [
                { categoryName: LoanName.HOME, minEligibleAmount: 500000 },
                { categoryName: LoanName.COMMODITY, minEligibleAmount: 500000 },
                { categoryName: LoanName.HOUSING, minEligibleAmount: 500000 },
                { categoryName: LoanName.EMERGENCY, minEligibleAmount: 500000 },
            ],
        },
    ];

    for (const rank of ranks) {
        const regularCategory = await prisma.loanCategory.findUnique({
            where: { name: LoanName.REGULAR },
        });

        await prisma.rankCompensation.create({
            data: {
                name: rank.name,
                minimum_saving_amount: rank.minimumSaving,
                maximum_loan_deduction: rank.maxLoanDeduction,
                lowest_salary_range: rank.lowestSalaryRange,
                // REGULAR loan terms
                loanTerms: {
                    create: rank.regularLoanTerms.map((term) => ({
                        durationMonths: term.duration,
                        maximumAmount: term.maxAmount,
                        interestRate: term.interestRate,
                        loanCategoryId: regularCategory?.id,
                    })),
                },
                // Special category eligibility
                eligibleCategories: {
                    create: rank.eligibleCategories.map((eligibility) => ({
                        loanCategory: {
                            connect: { name: eligibility.categoryName },
                        },
                        minEligibleAmount: eligibility.minEligibleAmount,
                    })),
                },
            },
        });
    }
}

async function seedSavingsType() {
    await prisma.savingCategory.create({
        data: {
            name: "Quick Savings",
            type: "QUICK",
            interestRate: 0,
        },
    });

    await prisma.savingCategory.create({
        data: {
            name: "Cooperative Savings",
            type: "COOPERATIVE",
            interestRate: 5.0,
        },
    });
}

async function main() {
    // // await prisma.loanCategory.deleteMany({});
    // await prisma.transaction.deleteMany({});
    // await prisma.repayment.deleteMany({});
    // // await prisma.loan.deleteMany({});
    // await prisma.transaction.deleteMany({});
    // await prisma.member.deleteMany({});
    // // await prisma.repayment.deleteMany({});
    // // await prisma.loan.deleteMany({});
    // // await prisma.member.deleteMany({});
    await prisma.repayment.deleteMany({});
    await prisma.loan.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.saving.deleteMany({});
    await prisma.member.deleteMany({});

    // await seedDatabase();
    // await seedSavingsType();
    console.log("Seeding completed for selected tables");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
