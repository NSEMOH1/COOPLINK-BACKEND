-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEMBER', 'STAFF', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "Rank" AS ENUM ('AVM', 'AIR_CDRE', 'GP_CAPT', 'WG_CDR', 'SQN_LDR', 'FLT_LT', 'FG_OFFR', 'PLT_OFFR', 'AWO', 'MWO', 'WO', 'FS', 'SGT', 'CPL', 'LCPL', 'ACM');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Relationship" AS ENUM ('SPOUSE', 'PARTNER', 'FATHER', 'MOTHER', 'SON', 'DAUGHTER', 'GUARDIAN', 'SIBLING', 'OTHER');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('IT', 'ACCOUNT', 'ARCHIVE', 'LEGAL', 'OPERATION', 'CUSTOMER_CARE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('LOAN_DISBURSEMENT', 'LOAN_REPAYMENT', 'SAVINGS_DEPOSIT', 'SAVINGS_WITHDRAWAL', 'FEE', 'ADJUSTMENT', 'LOAN_APPROVED', 'LOAN_REJECTED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'DEFAULTED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "SavingStatus" AS ENUM ('PENDING', 'FAILED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RepaymentStatus" AS ENUM ('PENDING', 'PAID', 'LATE', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('CIVILIAN', 'PERSONEL');

-- CreateEnum
CREATE TYPE "SavingType" AS ENUM ('NORMAL_SAVINGS', 'COOPERATIVE');

-- CreateEnum
CREATE TYPE "LoanName" AS ENUM ('EMERGENCY', 'HOME', 'COMMODITY', 'REGULAR', 'HOUSING');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SUCCESS', 'INFO', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Title" AS ENUM ('MR', 'MRS', 'MISS');

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "first_name" TEXT NOT NULL,
    "title" "Title" NOT NULL,
    "last_name" TEXT NOT NULL,
    "other_name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "state_of_origin" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "type" "MemberType" NOT NULL DEFAULT 'CIVILIAN',
    "lga" TEXT NOT NULL DEFAULT 'LAGOS',
    "date_of_birth" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "profile_picture" TEXT,
    "totalSavings" INTEGER NOT NULL,
    "monthySavings" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "civilian" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "civilian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personel" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "service_number" TEXT NOT NULL,
    "rank" "Rank" NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "personel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_info" (
    "id" TEXT NOT NULL,
    "identification" TEXT,
    "id_card" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "kyc_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_question" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "security_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "next_of_kin" (
    "id" TEXT NOT NULL,
    "title" "Title" NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "relationship" "Relationship" NOT NULL,
    "gender" "Gender" NOT NULL,
    "nin" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personelId" TEXT,

    CONSTRAINT "next_of_kin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guarantor" (
    "id" TEXT NOT NULL,
    "title" "Title" NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "relationship" "Relationship" NOT NULL,
    "gender" "Gender" NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "civilianId" TEXT,
    "rank" "Rank" NOT NULL,
    "unit" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guarantor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "full_name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "rank" "Rank" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "department" "Department" NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_category" (
    "id" TEXT NOT NULL,
    "name" "LoanName" NOT NULL,
    "description" TEXT,
    "interestRate" DECIMAL(5,2),
    "minAmount" DECIMAL(15,2),
    "maxAmount" DECIMAL(15,2),
    "minDuration" INTEGER,
    "maxDuration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rank_compensation" (
    "id" TEXT NOT NULL,
    "name" "Rank" NOT NULL,
    "minimum_saving_amount" DECIMAL(10,2) NOT NULL,
    "maximum_loan_deduction" DECIMAL(10,2) NOT NULL,
    "lowest_salary_range" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "rank_compensation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_terms" (
    "id" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "maximumAmount" DECIMAL(10,2) NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "rankCompensationId" TEXT NOT NULL,
    "loanCategoryId" TEXT,

    CONSTRAINT "loan_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rank_loan_eligibility" (
    "id" TEXT NOT NULL,
    "rankCompensationId" TEXT NOT NULL,
    "loanCategoryId" TEXT NOT NULL,
    "minEligibleAmount" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "rank_loan_eligibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "approvedAmount" DECIMAL(65,30) NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "interestRate" INTEGER NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "memberId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "otp" VARCHAR(6),
    "otpExpiresAt" TIMESTAMP(3),

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SavingType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "savings_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "memberId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "SavingStatus" NOT NULL,

    CONSTRAINT "savings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repayments" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "RepaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repayments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loanId" TEXT,
    "savingId" TEXT,
    "memberId" TEXT,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "actionType" TEXT NOT NULL,
    "actionId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "members_phone_key" ON "members"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "civilian_memberId_key" ON "civilian"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "personel_memberId_key" ON "personel"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "personel_service_number_key" ON "personel"("service_number");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_info_memberId_key" ON "kyc_info"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "next_of_kin_phone_key" ON "next_of_kin"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "next_of_kin_email_key" ON "next_of_kin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "guarantor_phone_key" ON "guarantor"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "guarantor_email_key" ON "guarantor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "loan_category_name_key" ON "loan_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "loan_terms_rankCompensationId_durationMonths_key" ON "loan_terms"("rankCompensationId", "durationMonths");

-- CreateIndex
CREATE UNIQUE INDEX "rank_loan_eligibility_rankCompensationId_loanCategoryId_key" ON "rank_loan_eligibility"("rankCompensationId", "loanCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "savings_category_name_key" ON "savings_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "savings_memberId_key" ON "savings"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_memberId_key" ON "transactions"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_memberId_key" ON "notifications"("memberId");

-- AddForeignKey
ALTER TABLE "civilian" ADD CONSTRAINT "civilian_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personel" ADD CONSTRAINT "personel_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_info" ADD CONSTRAINT "kyc_info_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banks" ADD CONSTRAINT "banks_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_question" ADD CONSTRAINT "security_question_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "next_of_kin" ADD CONSTRAINT "next_of_kin_personelId_fkey" FOREIGN KEY ("personelId") REFERENCES "personel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guarantor" ADD CONSTRAINT "guarantor_civilianId_fkey" FOREIGN KEY ("civilianId") REFERENCES "civilian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_terms" ADD CONSTRAINT "loan_terms_rankCompensationId_fkey" FOREIGN KEY ("rankCompensationId") REFERENCES "rank_compensation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_terms" ADD CONSTRAINT "loan_terms_loanCategoryId_fkey" FOREIGN KEY ("loanCategoryId") REFERENCES "loan_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rank_loan_eligibility" ADD CONSTRAINT "rank_loan_eligibility_rankCompensationId_fkey" FOREIGN KEY ("rankCompensationId") REFERENCES "rank_compensation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rank_loan_eligibility" ADD CONSTRAINT "rank_loan_eligibility_loanCategoryId_fkey" FOREIGN KEY ("loanCategoryId") REFERENCES "loan_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "loan_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings" ADD CONSTRAINT "savings_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings" ADD CONSTRAINT "savings_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "savings_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repayments" ADD CONSTRAINT "repayments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_savingId_fkey" FOREIGN KEY ("savingId") REFERENCES "savings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
