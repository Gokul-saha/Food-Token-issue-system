export enum PaymentType {
    Paid = 'Paid',
    Free = 'Free',
}

export interface Token {
    id: string;
    receiverName: string;
    department: string;
    location: string;
    mealType: string;
    paymentType: PaymentType;
    reason?: string;
    issuedBy: string;
    issuedAt: string; // ISO string
    
    // New fields for payment tracking
    paymentStatus?: 'Paid' | 'Unpaid';
    paidAmount?: number;
    paymentDate?: string; // ISO string
    paymentMethod?: 'Cash' | 'Online';
}

export interface DailySummaryData {
    mealType: string;
    total: number;
    paid: number;
    free: number;
    revenue: number;
}

export interface InstitutionData {
    name: string;
    count: number;
}

export interface InstitutionReportData extends InstitutionData {
    revenue: number;
}

export interface ReasonData {
    name: string;
    count: number;
}
