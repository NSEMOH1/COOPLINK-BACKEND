import { Request } from "express";
import {
    Role,
    Rank,
    Gender,
    Department,
    Relationship,
    LoanName,
    Title,
    MemberType,
    LoanStatus,
    MemberStatus,
    UserStatus,
    TransactionType,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        first_name?: string;
        last_name?: string;
        role: Role;
        full_name?: string;
    };
}

export interface CreateMemberData {
    email: string;
    first_name: string;
    last_name: string;
    other_name?: string;
    gender: string;
    phone: string;
    title: string;
    address: string;
    state_of_origin: string;
    lga: string;
    type: MemberType;
    pin: string;
    date_of_birth: Date;
    service_number?: string;
    profile_picture?: string;
    totalSavings?: number;
    monthlyDeduction: number;
    bank: {
        name: string;
        account_number: string;
    };
    kycInfo?: {
        identification?: string;
        id_card?: string;
        signature?: string;
    };
    security: {
        question: string;
        answer: string;
    };
    rank?: string;
    unit?: string;
    nextOfKin: {
        title: string;
        first_name: string;
        last_name: string;
        relationship: string;
        phone: string;
        email?: string;
        address?: string;
        gender: string;
    };
    guarantors?: Array<{
        title: string;
        first_name: string;
        surname: string;
        relationship: string;
        gender: string;
        phone: string;
        email?: string;
        address: string;
        rank: string;
        unit?: string;
        date_of_birth: Date;
    }>;
}

export interface UpdateMemberData {
    email?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
    other_name?: string;
    title?: Title;
    gender?: Gender;
    phone?: string;
    address?: string;
    state_of_origin?: string;
    lga?: string;
    type?: MemberType;
    role?: Role;
    profile_picture?: string;
    bank: {
        name: string;
        account_number: string;
    };
    kycInfo: {
        identification: string;
        id_card: string;
        signature: string;
    };
    rank?: Rank;
    unit?: string;

    nextOfKin?: {
        first_name: string;
        last_name: string;
        relationship: Relationship;
        title: Title;
        phone: string;
        email?: string;
        address?: string;
        gender: Gender;
    };

    guarantors?: Array<{
        title: Title;
        first_name: string;
        surname: string;
        relationship: Relationship;
        gender: Gender;
        phone: string;
        email?: string;
        address: string;
        rank: Rank;
        unit?: string;
        date_of_birth: Date;
    }>;
}

export type MemberCreationData =
    | {
          type: "PERSONEL";
          service_number: string;
          rank: Rank;
          unit?: string;
          nextOfKin: {
              first_name: string;
              last_name: string;
              relationship: Relationship;
              title: Title;
              nin?: string;
              phone: string;
              email?: string;
              address?: string;
              gender: Gender;
          };
      }
    | {
          type: "CIVILIAN";
          guarantors: Array<{
              title: Title;
              first_name: string;
              last_name: string;
              relationship: Relationship;
              gender: Gender;
              phone: string;
              email?: string;
              address: string;
              rank: Rank;
              unit?: string;
              date_of_birth: Date;
          }>;
      };

export interface LoginData {
    service_number: string;
    password: string;
}

export interface UserLoginData {
    email: string;
    password: string;
}

export interface CreateUserData {
    email: string;
    full_name: string;
    password: string;
    role: Role;
    department: Department;
}

export interface UpdateUserData {
    email?: string;
    full_name?: string;
    password?: string;
    role?: Role;
    rank?: Rank;
    department?: Department;
}

export interface UserResponse {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    other_name: string;
    gender: Gender;
    phone: string;
    address: string;
    state_of_origin: string;
    service_number: string;
    role: Role;
    rank: Rank;
    created_at: Date;
    updated_at: Date;
}

export interface AuthResponse {
    token: string;
    user: UserResponse;
}

export interface JwtPayload {
    id: string;
    email: string;
    [key: string]: any;
}

export interface GetAllMembersParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "created_at" | "email" | "first_name" | "last_name";
    sortOrder?: "asc" | "desc";
    role?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    status?: MemberStatus;
}

export interface GetAllUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "created_at" | "email";
    sortOrder?: "asc" | "desc";
    role?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    status?: UserStatus;
}

export interface PaginatedMembersResponse {
    users: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        created_at: Date;
    }[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalMembers: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface PaginatedUsersResponse {
    users: {
        id: string;
        email: string;
        full_name: string;
        status: UserStatus;
        created_at: Date;
    }[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalUsers: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface LoanApplication {
    memberId: string;
    category_name: LoanName;
    amount: Decimal;
    durationMonths: number;
    interestRate: number;
    purpose?: string;
}

export interface createSavings {
    memberId: string;
    category_name: string;
    amount: Decimal;
}

export interface IWithdrawSavings {
    memberId: string;
    category_name: string;
    amount: Decimal;
    pin: string;
}
export interface CreateNotificationData {
    memberId: string;
    title: string;
    message: string;
    type: "SUCCESS" | "INFO" | "WARNING" | "ERROR";
    actionType: string;
    actionId?: string;
    metadata?: Record<string, any>;
}

export interface LoanBalanceResponse {
    success: boolean;
    data?: {
        loans: LoanBalance[];
        summary: {
            totalOutstanding: number;
            totalPaid: number;
            activeLoans: number;
            completedLoans: number;
            defaultedLoans: number;
        };
    };
    message?: string;
}

export interface LoanBalance {
    loanId: string;
    category: LoanName;
    reference: string;
    originalAmount: number;
    approvedAmount: number;
    interestRate: number;
    durationMonths: number;
    totalPaid: number;
    outstandingBalance: number;
    status: LoanStatus;
    startDate?: string;
    endDate?: string;
    nextPayment?: {
        dueDate: string;
        amount: number;
    };
    repaymentProgress: {
        paid: number;
        remaining: number;
        percentage: number;
    };
}

export interface SavingsBalance {
    totalSavings: number;
    normalSavings: number;
    cooperativeSavings: number;
    details: Array<{
        categoryId: string;
        categoryName: string;
        amount: number;
    }>;
}

export interface FinancialReport {
    period: {
        start: Date;
        end: Date;
    };
    totals: {
        income: number;
        expenses: number;
        netProfit: number;
    };
    breakdown: {
        loanInterest: number;
        fees: number;
        penalties: number;
        operationalCosts: number;
    };
}

export interface TrialBalanceReport {
    period: Date;
    accounts: {
        name: string;
        debit: number;
        credit: number;
    }[];
    totals: {
        debit: number;
        credit: number;
    };
}

export interface ProfitLossReport {
    period: {
        start: Date;
        end: Date;
    };
    revenue: {
        loanInterest: number;
        fees: number;
        otherIncome: number;
        total: number;
    };
    expenses: {
        salaries: number;
        operational: number;
        loanLossProvision: number;
        total: number;
    };
    netProfit: number;
}

export interface BalanceSheetReport {
    date: Date;
    assets: {
        current: {
            cash: number;
            receivables: number;
            loansOutstanding: number;
            total: number;
        };
        fixed: number;
        total: number;
    };
    liabilities: {
        current: number;
        longTerm: number;
        total: number;
    };
    equity: number;
}
export interface LoanRepaymentReport {
    period: {
        start: Date;
        end: Date;
    };
    summary: {
        totalDue: number;
        totalPaid: number;
        totalOverdue: number;
        collectionRate: number;
    };
    breakdown: {
        byLoanType: {
            name: string;
            due: number;
            paid: number;
            overdue: number;
        }[];
        byRank: {
            rank: string;
            due: number;
            paid: number;
            overdue: number;
        }[];
    };
}

export interface MemberLoanHistory {
    id: string;
    reference: string;
    category: string;
    appliedAmount: number;
    approvedAmount: number;
    interestRate: number;
    durationMonths: number;
    status: LoanStatus;
    applicationDate: Date;
    approvalDate: Date | null;
    completionDate: Date | null;
    totalRepaid: number;
    outstandingBalance: number;
    nextPaymentDue?: {
        date: Date;
        amount: number;
    };
    repayments: {
        dueDate: Date;
        amount: number;
        status: string;
        paidDate: Date | null;
    }[];
    transactions: {
        id: string;
        type: TransactionType;
        amount: number;
        date: Date;
        status: string;
        description: string;
    }[];
}

export interface FileData {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
}
