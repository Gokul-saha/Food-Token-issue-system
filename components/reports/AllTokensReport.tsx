import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Token, PaymentType } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { EditIcon, TrashIcon } from '../ui/Icons';
import ExportButtons from '../ui/ExportButtons';

const EditTokenForm: React.FC<{ token: Token; onClose: () => void; }> = ({ token, onClose }) => {
    const { state, dispatch } = useAppContext();
    const [formData, setFormData] = useState<Token>(token);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'paidAmount' ? parseFloat(value) : value });
    };
    

    const handleSubmit = () => {
        const updatedData = { ...formData };
        if (updatedData.paymentType === PaymentType.Paid) {
            // if status is changed to Paid and there's no payment date, set it now.
            if (updatedData.paymentStatus === 'Paid' && token.paymentStatus !== 'Paid') {
                updatedData.paymentDate = new Date().toISOString();
            }
            // if status is changed back to Unpaid, clear payment date.
            if (updatedData.paymentStatus === 'Unpaid') {
                updatedData.paymentDate = undefined;
            }
        }
        dispatch({ type: 'UPDATE_TOKEN', payload: updatedData });
        onClose();
    };
    
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="receiverName">Receiver Name</Label>
                    <Input id="receiverName" name="receiverName" value={formData.receiverName} onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" name="department" value={formData.department} onChange={handleChange} />
                </div>
            </div>
             <div>
                <Label htmlFor="location">Location</Label>
                <Select id="location" name="location" value={formData.location} onChange={handleChange}>
                    {state.locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="mealType">Meal Type</Label>
                    <Select id="mealType" name="mealType" value={formData.mealType} onChange={handleChange}>
                        {state.mealTypes.map(mt => <option key={mt} value={mt}>{mt}</option>)}
                    </Select>
                </div>
                 <div>
                    <Label htmlFor="paymentType">Payment Type</Label>
                    <Select id="paymentType" name="paymentType" value={formData.paymentType} onChange={handleChange}>
                        {Object.values(PaymentType).map(pt => <option key={pt} value={pt}>{pt}</option>)}
                    </Select>
                </div>
            </div>
            {formData.paymentType === PaymentType.Paid && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="paidAmount">Amount</Label>
                            <Input id="paidAmount" name="paidAmount" type="number" value={formData.paidAmount || ''} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="paymentStatus">Payment Status</Label>
                            <Select id="paymentStatus" name="paymentStatus" value={formData.paymentStatus || 'Unpaid'} onChange={handleChange}>
                                <option value="Unpaid">Unpaid</option>
                                <option value="Paid">Paid</option>
                            </Select>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod || 'Cash'} onChange={handleChange}>
                            <option value="Cash">Cash</option>
                            <option value="Online">Online</option>
                        </Select>
                    </div>
                </>
            )}
            {formData.paymentType === PaymentType.Free && (
                 <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Input id="reason" name="reason" value={formData.reason || ''} onChange={handleChange} />
                </div>
            )}
            <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Save Changes</Button>
            </div>
        </div>
    );
};


const AllTokensReport: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingToken, setEditingToken] = useState<Token | null>(null);

    const filteredTokens = useMemo(() => {
        return state.tokens
            .filter(token =>
                token.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                token.issuedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                token.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                token.location.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
    }, [state.tokens, searchTerm]);
    
    const handleDelete = (tokenId: string) => {
        if (window.confirm('Are you sure you want to delete this token?')) {
            dispatch({ type: 'DELETE_TOKEN', payload: tokenId });
        }
    };

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
        <Card>
            <CardHeader>
                <CardTitle>All Issued Tokens</CardTitle>
                <CardDescription>View, search, edit, or delete any token issued.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <Input
                        placeholder="Search by receiver, issuer, department, location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:flex-grow"
                    />
                    <ExportButtons 
                        data={exportableData}
                        filename="all_tokens_report"
                        reportTitle="All Issued Tokens Report"
                    />
                </div>
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Receiver</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
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
                                        <div className={token.paymentType === PaymentType.Paid ? 'text-green-600' : 'text-orange-600'}>
                                            {token.paymentType}
                                            {token.reason && ` (${token.reason})`}
                                            {token.paymentType === PaymentType.Paid && ` - ₹${token.paidAmount?.toFixed(2)} (${token.paymentMethod}) `}
                                            {token.paymentType === PaymentType.Paid && 
                                                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${token.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {token.paymentStatus}
                                                </span>
                                            }
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <div>{new Date(token.issuedAt).toLocaleDateString()}</div>
                                        <div>{new Date(token.issuedAt).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                       <div className="flex items-center space-x-2">
                                         <Button variant="ghost" size="sm" onClick={() => setEditingToken(token)}><EditIcon /></Button>
                                         <Button variant="ghost" size="sm" onClick={() => handleDelete(token.id)}><TrashIcon /></Button>
                                       </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-slate-500">No tokens found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {editingToken && (
                    <Modal isOpen={!!editingToken} onClose={() => setEditingToken(null)} title="Edit Token">
                        <EditTokenForm token={editingToken} onClose={() => setEditingToken(null)} />
                    </Modal>
                )}

            </CardContent>
        </Card>
    );
};

export default AllTokensReport;
