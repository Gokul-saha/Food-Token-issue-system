import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { DailySummaryData, PaymentType } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Input } from '../ui/Input';
import ExportButtons from '../ui/ExportButtons';

const DailySummary: React.FC = () => {
    const { state } = useAppContext();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const summaryData: DailySummaryData[] = useMemo(() => {
        const filteredTokens = state.tokens.filter(token =>
            token.issuedAt.startsWith(selectedDate)
        );

        const summary: Record<string, { total: number; paid: number; free: number; revenue: number; }> = {};
        
        for (const token of filteredTokens) {
            if (!summary[token.mealType]) {
                summary[token.mealType] = { total: 0, paid: 0, free: 0, revenue: 0 };
            }
            summary[token.mealType].total++;
            if (token.paymentType === PaymentType.Paid) {
                summary[token.mealType].paid++;
                summary[token.mealType].revenue += token.paidAmount || 0;
            } else {
                summary[token.mealType].free++;
            }
        }

        return Object.entries(summary).map(([mealType, data]) => ({
            mealType: mealType,
            ...data,
        })).sort((a,b) => a.mealType.localeCompare(b.mealType));
        
    }, [state.tokens, selectedDate]);

    const exportableData = useMemo(() => summaryData.map(d => ({
        'Meal Type': d.mealType,
        'Total Tokens': d.total,
        'Paid': d.paid,
        'Free': d.free,
        'Total Revenue (₹)': d.revenue.toFixed(2),
    })), [summaryData]);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div>
                        <CardTitle>Daily Summary Report</CardTitle>
                        <CardDescription>Token counts and revenue by meal for a selected day.</CardDescription>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full sm:w-auto"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex justify-end">
                    <ExportButtons 
                        data={exportableData}
                        filename={`daily_summary_${selectedDate}`}
                        reportTitle={`Daily Summary for ${selectedDate}`}
                    />
                </div>
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Meal Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Tokens</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Paid</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Free</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {summaryData.length > 0 ? summaryData.map((row) => (
                                <tr key={row.mealType}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{row.mealType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{row.total}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-green-600">{row.paid}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-orange-600">{row.free}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">₹{row.revenue.toFixed(2)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-slate-500">No tokens issued on this day.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default DailySummary;