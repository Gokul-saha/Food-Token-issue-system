import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { PaymentType, Token } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Select } from './ui/Select';
import { Alert, AlertDescription, AlertTitle } from './ui/Alert';

const IssueTokenForm: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [mealType, setMealType] = useState<string>('');
    const [location, setLocation] = useState<string>(state.locations[0] || '');
    const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.Paid);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Online'>('Cash');
    const [reason, setReason] = useState('');
    const [receiverName, setReceiverName] = useState('');
    const [department, setDepartment] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showReasonInput, setShowReasonInput] = useState(false);

    const memoizedLocations = useMemo(() => state.locations, [state.locations]);
    const memoizedMealTypes = useMemo(() => state.mealTypes, [state.mealTypes]);
    const memoizedFreeReasons = useMemo(() => state.commonFreeReasons, [state.commonFreeReasons]);

    useEffect(() => {
        if (memoizedMealTypes.length > 0 && !mealType) {
            setMealType(memoizedMealTypes[0]);
        }
    }, [memoizedMealTypes, mealType]);
    
    useEffect(() => {
        if (paymentType === PaymentType.Paid && mealType) {
            setPaidAmount(String(state.mealPrices[mealType] || ''));
        } else {
            setPaidAmount('');
        }
    }, [mealType, paymentType, state.mealPrices]);


    const handleReasonChange = (value: string) => {
        if (value === 'Other') {
            setShowReasonInput(true);
            setReason('');
        } else {
            setShowReasonInput(false);
            setReason(value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!receiverName || !department || !location || !mealType) {
            setError('Receiver Name, Department, Location, and Meal Type are required.');
            return;
        }

        if (paymentType === PaymentType.Free && !reason) {
            setError('Reason is required for free tokens.');
            return;
        }
        
        if (paymentType === PaymentType.Paid && (!paidAmount || isNaN(parseFloat(paidAmount)) || parseFloat(paidAmount) <= 0)) {
            setError('A valid, positive amount is required for paid tokens.');
            return;
        }

        const newToken: Token = {
            id: `TKN-${Date.now()}`,
            receiverName,
            department,
            location,
            mealType,
            paymentType,
            reason: paymentType === PaymentType.Free ? reason : undefined,
            issuedBy: 'Admin Staff', // In a real app, this would be the logged-in user
            issuedAt: new Date().toISOString(),
            ...(paymentType === PaymentType.Paid && {
                paidAmount: parseFloat(paidAmount),
                paymentStatus: 'Unpaid',
                paymentMethod: paymentMethod,
            }),
        };

        dispatch({ type: 'ADD_TOKEN', payload: newToken });
        setSuccess(`Token ${newToken.id} issued successfully!`);

        // Reset form
        setReceiverName('');
        setDepartment('');
        setReason('');
        setPaymentType(PaymentType.Paid);
        setPaymentMethod('Cash');
        setShowReasonInput(false);
        setPaidAmount(String(state.mealPrices[mealType] || ''));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Issue New Food Token</CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {success && (
                    <Alert variant="success" className="mb-4">
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="receiverName">Receiver Name</Label>
                            <Input id="receiverName" value={receiverName} onChange={e => setReceiverName(e.target.value)} placeholder="e.g., John Doe" />
                        </div>
                        <div>
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g., IT Department" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <Label>Meal Type</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {memoizedMealTypes.length > 0 ? memoizedMealTypes.map(mt => (
                                    <Button key={mt} type="button" variant={mealType === mt ? 'default' : 'outline'} onClick={() => setMealType(mt)} className="flex-grow">
                                        {mt}
                                    </Button>
                                )) : <p className="text-sm text-slate-500">No meal types configured.</p>}
                            </div>
                        </div>
                         <div>
                            <Label htmlFor="location">Location / Institution</Label>
                            <Select id="location" value={location} onChange={e => setLocation(e.target.value)}>
                                {memoizedLocations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </Select>
                        </div>
                    </div>
                    
                    <div>
                        <Label>Payment Type</Label>
                        <div className="flex items-center space-x-4 mt-2">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="paymentType" value={PaymentType.Paid} checked={paymentType === PaymentType.Paid} onChange={() => setPaymentType(PaymentType.Paid)} className="form-radio text-indigo-600"/>
                                <span>Paid</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="paymentType" value={PaymentType.Free} checked={paymentType === PaymentType.Free} onChange={() => setPaymentType(PaymentType.Free)} className="form-radio text-indigo-600"/>
                                <span>Free</span>
                            </label>
                        </div>
                    </div>
                    
                    {paymentType === PaymentType.Paid && (
                        <div className="animate-in fade-in duration-300 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="paidAmount">Amount to be Paid (₹)</Label>
                                <Input 
                                    id="paidAmount" 
                                    type="number" 
                                    value={paidAmount} 
                                    onChange={e => setPaidAmount(e.target.value)} 
                                    placeholder="e.g., 50" 
                                    min="0"
                                    step="1"
                                />
                            </div>
                             <div>
                                <Label>Payment Method</Label>
                                <div className="flex items-center space-x-4 mt-2">
                                     <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="paymentMethod" value="Cash" checked={paymentMethod === 'Cash'} onChange={() => setPaymentMethod('Cash')} className="form-radio text-indigo-600"/>
                                        <span>Cash</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="paymentMethod" value="Online" checked={paymentMethod === 'Online'} onChange={() => setPaymentMethod('Online')} className="form-radio text-indigo-600"/>
                                        <span>Online</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentType === PaymentType.Free && (
                        <div className="space-y-2 animate-in fade-in duration-300">
                             <Label htmlFor="reason-select">Reason for Free Token</Label>
                             <div className="flex space-x-2">
                                <Select id="reason-select" onChange={e => handleReasonChange(e.target.value)} className="flex-grow">
                                     <option value="">Select a reason</option>
                                    {memoizedFreeReasons.map(r => <option key={r} value={r}>{r}</option>)}
                                    <option value="Other">Other...</option>
                                </Select>
                             </div>
                            {showReasonInput && (
                                <Input
                                    id="reason"
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    placeholder="Please specify the reason"
                                    className="mt-2"
                                />
                            )}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button type="submit" size="lg" disabled={memoizedMealTypes.length === 0}>Issue Token</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default IssueTokenForm;
