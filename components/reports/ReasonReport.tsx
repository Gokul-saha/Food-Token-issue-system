import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PaymentType, ReasonData } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Input } from '../ui/Input';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ExportButtons from '../ui/ExportButtons';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const ReasonReport: React.FC = () => {
    const { state } = useAppContext();
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);

    const [startDate, setStartDate] = useState(lastMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const reportData: ReasonData[] = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        const filteredTokens = state.tokens.filter(token => {
            const tokenDate = new Date(token.issuedAt);
            return token.paymentType === PaymentType.Free && tokenDate >= start && tokenDate <= end;
        });

        const counts = filteredTokens.reduce((acc, token) => {
            const reason = token.reason || 'Unspecified';
            acc[reason] = (acc[reason] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

    }, [state.tokens, startDate, endDate]);

    const exportableData = useMemo(() => reportData.map(d => ({
        'Reason': d.name,
        'Count': d.count,
    })), [reportData]);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <CardTitle>Reason-Wise Report (Free Tokens)</CardTitle>
                        <CardDescription>Breakdown of free tokens by reason for a selected date range.</CardDescription>
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
                        filename={`reason_report_${startDate}_to_${endDate}`}
                        reportTitle={`Reason-Wise Report (Free Tokens) ${startDate} to ${endDate}`}
                    />
                </div>
                {reportData.length > 0 ? (
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={reportData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={150}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="name"
                                    // Fix: The 'percent' prop from recharts can be undefined. Coerce it to a number to prevent type errors during arithmetic operations.
                                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                                >
                                    {reportData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-500">
                        No free tokens found for the selected date range.
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ReasonReport;