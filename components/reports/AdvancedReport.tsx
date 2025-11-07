import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Token, PaymentType } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import ExportButtons from '../ui/ExportButtons';

const AdvancedReport: React.FC = () => {
    const { state } = useAppContext();
    const today = new Date().toISOString().split('T')[0];
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(lastMonthStr);
    const [endDate, setEndDate] = useState(today);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
    const [paymentTypeFilter, setPaymentTypeFilter] = useState<'All' | 'Paid' | 'Free'>('All');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<'All' | 'Cash' | 'Online'>('All');
    
    const handleMultiSelectChange = (
        setter: React.Dispatch<React.SetStateAction<string[]>>,
        currentValues: string[],
        value: string
    ) => {
        if (currentValues.includes(value)) {
            setter(currentValues.filter(v => v !== value));
        } else {
            setter([...currentValues, value]);
        }
    };
    
    const filteredTokens = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return state.tokens.filter(token => {
            const tokenDate = new Date(token.issuedAt);
            if (tokenDate < start || tokenDate > end) return false;
            if (selectedLocations.length > 0 && !selectedLocations.includes(token.location)) return false;
            if (selectedMealTypes.length > 0 && !selectedMealTypes.includes(token.mealType)) return false;
            if (paymentTypeFilter !== 'All' && token.paymentType !== paymentTypeFilter) return false;
            if (paymentTypeFilter === 'Paid' && paymentMethodFilter !== 'All' && token.paymentMethod !== paymentMethodFilter) return false;
            
            return true;
        }).sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
    }, [state.tokens, startDate, endDate, selectedLocations, selectedMealTypes, paymentTypeFilter, paymentMethodFilter]);

    const summary = useMemo(() => {
        return filteredTokens.reduce((acc, token) => {
            acc.totalTokens++;
            if (token.paymentType === 'Paid') {
                acc.paidTokens++;
                acc.totalRevenue += token.paidAmount || 0;
                if (token.paymentMethod === 'Cash') acc.cashRevenue += token.paidAmount || 0;
                if (token.paymentMethod === 'Online') acc.onlineRevenue += token.paidAmount || 0;
            } else {
                acc.freeTokens++;
            }
            return acc;
        }, {
            totalTokens: 0,
            paidTokens: 0,
            freeTokens: 0,
            totalRevenue: 0,
            cashRevenue: 0,
            onlineRevenue: 0,
        });
    }, [filteredTokens]);

    const exportableData = useMemo(() => filteredTokens.map(token => ({
        'Token ID': token.id,
        'Receiver Name': token.receiverName,
        'Department': token.department,
        'Location': token.location,
        'Meal Type': token.mealType,
        'Payment Type': token.paymentType,
        'Amount (₹)': token.paymentType === PaymentType.Paid ? token.paidAmount?.toFixed(2) : 'N/A',
        'Payment Method': token.paymentType === PaymentType.Paid ? token.paymentMethod : 'N/A',
        'Payment Status': token.paymentType === PaymentType.Paid ? token.paymentStatus : 'N/A',
        'Reason (if free)': token.reason || 'N/A',
        'Issued By': token.issuedBy,
        'Issued At': new Date(token.issuedAt).toLocaleString(),
    })), [filteredTokens]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Advanced Report</CardTitle>
                    <CardDescription>Filter and analyze token data across multiple dimensions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-slate-50">
                        {/* Filters */}
                        <div>
                            <Label>Date Range</Label>
                            <div className="flex flex-col gap-2">
                                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <Label>Payment Type</Label>
                            <Select value={paymentTypeFilter} onChange={e => setPaymentTypeFilter(e.target.value as any)}>
                                <option value="All">All Payment Types</option>
                                <option value="Paid">Paid</option>
                                <option value="Free">Free</option>
                            </Select>
                            {paymentTypeFilter === 'Paid' && (
                                <div className="mt-2">
                                    <Label>Payment Method</Label>
                                    <Select value={paymentMethodFilter} onChange={e => setPaymentMethodFilter(e.target.value as any)}>
                                        <option value="All">All Methods</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Online">Online</option>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <div>
                            <Label>Institutions ({selectedLocations.length || 'All'})</Label>
                            <div className="border rounded-md p-2 bg-white max-h-32 overflow-y-auto">
                                {state.locations.map(loc => (
                                    <label key={loc} className="flex items-center space-x-2 text-sm">
                                        <input type="checkbox" checked={selectedLocations.includes(loc)} onChange={() => handleMultiSelectChange(setSelectedLocations, selectedLocations, loc)} />
                                        <span>{loc}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label>Meal Types ({selectedMealTypes.length || 'All'})</Label>
                             <div className="border rounded-md p-2 bg-white max-h-32 overflow-y-auto">
                                {state.mealTypes.map(mt => (
                                    <label key={mt} className="flex items-center space-x-2 text-sm">
                                        <input type="checkbox" checked={selectedMealTypes.includes(mt)} onChange={() => handleMultiSelectChange(setSelectedMealTypes, selectedMealTypes, mt)} />
                                        <span>{mt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
             <Card>
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                    <CardDescription>Metrics based on your current filter selection.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-slate-100 rounded-lg">
                            <p className="text-sm text-slate-500">Total Tokens</p>
                            <p className="text-2xl font-bold">{summary.totalTokens}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-600">Paid Tokens</p>
                            <p className="text-2xl font-bold text-green-800">{summary.paidTokens}</p>
                        </div>
                         <div className="p-4 bg-orange-50 rounded-lg">
                            <p className="text-sm text-orange-600">Free Tokens</p>
                            <p className="text-2xl font-bold text-orange-800">{summary.freeTokens}</p>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-lg">
                            <p className="text-sm text-indigo-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-indigo-800">₹{summary.totalRevenue.toFixed(2)}</p>
                        </div>
                         {paymentTypeFilter === 'Paid' && (
                            <>
                                <div className="p-4 bg-sky-50 rounded-lg">
                                    <p className="text-sm text-sky-600">Cash Revenue</p>
                                    <p className="text-2xl font-bold text-sky-800">₹{summary.cashRevenue.toFixed(2)}</p>
                                </div>
                                <div className="p-4 bg-teal-50 rounded-lg">
                                    <p className="text-sm text-teal-600">Online Revenue</p>
                                    <p className="text-2xl font-bold text-teal-800">₹{summary.onlineRevenue.toFixed(2)}</p>
                                </div>
                            </>
                         )}
                    </div>
                </CardContent>
             </Card>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                             <CardTitle>Filtered Results</CardTitle>
                             <CardDescription>{filteredTokens.length} tokens found.</CardDescription>
                        </div>
                        <ExportButtons
                            data={exportableData}
                            filename="advanced_report"
                            reportTitle="Advanced Token Report"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-slate-200">
                             <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Receiver</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Info</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredTokens.length > 0 ? filteredTokens.map(token => (
                                    <tr key={token.id}>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="font-semibold">{token.receiverName}</div>
                                            <div className="text-sm text-slate-500">{token.department}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <div><span className="font-semibold">{token.mealType}</span> at {token.location}</div>
                                            <div className="text-xs text-slate-400">{token.id}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <div className={token.paymentType === PaymentType.Paid ? 'text-green-600' : 'text-orange-600'}>
                                                {token.paymentType}
                                                {token.reason && ` (${token.reason})`}
                                            </div>
                                            {token.paymentType === PaymentType.Paid && (
                                                <div>
                                                    <span>₹{token.paidAmount?.toFixed(2)} ({token.paymentMethod})</span>
                                                    <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${token.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {token.paymentStatus}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(token.issuedAt).toLocaleString()}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-10 text-slate-500">No tokens match your filters.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdvancedReport;
