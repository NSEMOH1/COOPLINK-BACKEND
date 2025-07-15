//TEMPLATES
export const createLoanApplicationNotification = (
    amount: number,
    category: string
) => {
    return {
        title: "Loan Application Submitted",
        message: `Your ${category} loan application for $${amount.toLocaleString()} has been submitted successfully.`,
        type: "SUCCESS" as const,
        actionType: "LOAN_APPLIED",
    };
};

export const createLoanApprovedNotification = (
    amount: number,
    category: string
) => {
    return {
        title: "Loan Approved! 🎉",
        message: `Great news! Your ${category} loan for $${amount.toLocaleString()} has been approved.`,
        type: "SUCCESS" as const,
        actionType: "LOAN_APPROVED",
    };
};

export const createLoanRejectedNotification = (
    amount: number,
    category: string,
    reason?: string
) => {
    return {
        title: "Loan Application Update",
        message: `Your ${category} loan application for $${amount.toLocaleString()} was not approved. ${
            reason || "Please contact support for more details."
        }`,
        type: "WARNING" as const,
        actionType: "LOAN_REJECTED",
    };
};

export const createSavingsAddedNotification = (amount: number) => {
    return {
        title: "Savings Added",
        message: `You've successfully added $${amount.toLocaleString()} to your savings account.`,
        type: "SUCCESS" as const,
        actionType: "SAVINGS_CREATED",
    };
};

export const createPaymentDueNotification = (amount: number, dueDate: Date) => {
    return {
        title: "Payment Reminder",
        message: `Your loan payment of $${amount.toLocaleString()} is due on ${dueDate.toLocaleDateString()}.`,
        type: "INFO" as const,
        actionType: "PAYMENT_DUE",
    };
};

export const createPaymentOverdueNotification = (
    amount: number,
    daysPastDue: number
) => {
    return {
        title: "Payment Overdue",
        message: `Your payment of $${amount.toLocaleString()} is ${daysPastDue} days overdue. Please make payment immediately.`,
        type: "ERROR" as const,
        actionType: "PAYMENT_OVERDUE",
    };
};

export const createAccountLockedNotification = () => {
    return {
        title: "Account Security Alert",
        message:
            "Your account has been temporarily locked due to security concerns. Please contact support.",
        type: "ERROR" as const,
        actionType: "ACCOUNT_LOCKED",
    };
};

export const createWelcomeNotification = () => {
    return {
        title: "Welcome to Our Platform! 🎉",
        message:
            "Thank you for joining us. Start by exploring our loan and savings options.",
        type: "SUCCESS" as const,
        actionType: "USER_REGISTERED",
    };
};

export const createAccountActivatedNotification = () => {
    return {
        title: "Account Activated 🎉",
        message: "Your account has been activated by an administrator.",
        type: "SUCCESS" as const,
        actionType: "ACCOUNT_ACTIVATED",
    };
};


export const createProfileUpdatedNotification = () => {
    return {
        title: "Profile Updated",
        message: "Your profile information has been successfully updated.",
        type: "SUCCESS" as const,
        actionType: "PROFILE_UPDATED",
    };
};
