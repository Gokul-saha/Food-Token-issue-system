import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { InstitutionReportData, PaymentType } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Input } from '../ui/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ExportButtons from '../ui/ExportButtons';

const InstitutionReport: React.FC = () => {
    const { state } = useAppContext();
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);

    const [startDate, setStartDate] = useState(lastMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const reportData: InstitutionReportData[] = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        const filteredTokens = state.tokens.filter(token => {
            const tokenDate = new Date(token.issuedAt);
            return tokenDate >= start && tokenDate <= end;
        });

        const counts = filteredTokens.reduce((acc, token) => {
            const loc = token.location;
            if (!acc[loc]) {
                acc[loc] = { count: 0, revenue: 0 };
            }
            acc[loc].count++;
            if (token.paymentType === PaymentType.Paid) {
                acc[loc].revenue += token.paidAmount || 0;
            }
            return acc;
        }, {} as Record<string, { count: number; revenue: number }>);

        return state.locations.map(location => ({
            name: location,
            count: counts[location]?.count || 0,
            revenue: counts[location]?.revenue || 0,
        })).sort((a,b) => b.count - a.count);

    }, [state.tokens, state.locations, startDate, endDate]);

    const exportableData = useMemo(() => reportData.map(d => ({
        'Institution': d.name,
        'Total Tokens': d.count,
        'Total Revenue (₹)': d.revenue.toFixed(2),
    })), [reportData]);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <CardTitle>Institution-Wise Report</CardTitle>
                        <CardDescription>Total tokens and revenue by location for a selected date range.</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                         <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex justify-end">
                    <ExportButtons 
                        data={exportableData}
                        filename={`institution_report_${startDate}_to_${endDate}`}
                        reportTitle={`Institution-Wise Report (${startDate} to ${endDate})`}
                    />
                </div>
                <div style={{ width: '100%', height: 400 }}>
                     <ResponsiveContainer>
                        <BarChart
                            data={reportData}
                            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-30} textAnchor="end" height={80} interval={0} />
                            <YAxis allowDecimals={false} />
                            <Tooltip formatter={(value, name) => name === 'Total Revenue (₹)' ? `₹${Number(value).toFixed(2)}` : value} />
                            <Legend />
                            <Bar dataKey="count" fill="#4f46e5" name="Total Tokens" />
                            <Bar dataKey="revenue" fill="#10b981" name="Total Revenue (₹)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default InstitutionReport;