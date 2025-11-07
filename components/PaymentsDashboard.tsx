import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Token, PaymentType } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { NavButton } from './ui/NavButton';

type PaymentStatusFilter = 'All' | 'Paid' | 'Unpaid';

const PaymentsDashboard: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [filter, setFilter] = useState<PaymentStatusFilter>('Unpaid');

    const paidTokens = useMemo(() => {
        return state.tokens
            .filter(token => token.paymentType === PaymentType.Paid)
            .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
    }, [state.tokens]);

    const filteredTokens = useMemo(() => {
        if (filter === 'All') return paidTokens;
        return paidTokens.filter(token => token.paymentStatus === filter);
    }, [paidTokens, filter]);

    const handleMarkAsPaid = (token: Token) => {
        if (window.confirm(`Mark token ${token.id} for ${token.receiverName} as paid?`)) {
            const updatedToken: Token = {
                ...token,
                paymentStatus: 'Paid',
                paymentDate: new Date().toISOString(),
            };
            dispatch({ type: 'UPDATE_TOKEN', payload: updatedToken });
        }
    };

    const totalUnpaid = useMemo(() => {
        return paidTokens
            .filter(t => t.paymentStatus === 'Unpaid')
            .reduce((sum, t) => sum + (t.paidAmount || 0), 0);
    }, [paidTokens]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Payments Overview</CardTitle>
                    <CardDescription>Manage and track payments for all paid food tokens.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                        <h3 className="text-lg font-semibold">Total Amount Due: <span className="text-red-600">₹{totalUnpaid.toFixed(2)}</span></h3>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-2">
                        <NavButton size="sm" onClick={() => setFilter('Unpaid')} isActive={filter === 'Unpaid'}>Unpaid</NavButton>
                        <NavButton size="sm" onClick={() => setFilter('Paid')} isActive={filter === 'Paid'}>Paid</NavButton>
                        <NavButton size="sm" onClick={() => setFilter('All')} isActive={filter === 'All'}>All</NavButton>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <div className="overflow-x-auto border rounded-lg mt-4">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Receiver</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Method</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Issued Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
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
                                            <div>{token.mealType} at {token.location}</div>
                                            <div className="text-xs text-slate-400">{token.id}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap font-semibold">
                                            ₹{token.paidAmount?.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {token.paymentMethod}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                token.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {token.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(token.issuedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            {token.paymentStatus === 'Unpaid' && (
                                                <Button size="sm" onClick={() => handleMarkAsPaid(token)}>Mark as Paid</Button>
                                            )}
                                            {token.paymentStatus === 'Paid' && (
                                                <span className="text-sm text-slate-500">Paid on {new Date(token.paymentDate!).toLocaleDateString()}</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-10 text-slate-500">No tokens match the current filter.</td>
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

export default PaymentsDashboard;
