import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { PlusIcon, TrashIcon } from './ui/Icons';
import { Label } from './ui/Label';

const Settings: React.FC = () => {
    const { state, dispatch } = useAppContext();

    // State for locations
    const [newLocation, setNewLocation] = useState('');
    const [locationError, setLocationError] = useState('');

    // State for meal types
    const [newMealType, setNewMealType] = useState('');
    const [newMealPrice, setNewMealPrice] = useState('');
    const [mealTypeError, setMealTypeError] = useState('');

    // State for free reasons
    const [newFreeReason, setNewFreeReason] = useState('');
    const [freeReasonError, setFreeReasonError] = useState('');

    const handleAddLocation = () => {
        if (!newLocation.trim()) {
            setLocationError('Location name cannot be empty.');
            return;
        }
        if (state.locations.some(loc => loc.toLowerCase() === newLocation.trim().toLowerCase())) {
            setLocationError('This location already exists.');
            return;
        }
        setLocationError('');
        dispatch({ type: 'ADD_LOCATION', payload: newLocation.trim() });
        setNewLocation('');
    };
    
    const handleDeleteLocation = (location: string) => {
        if (window.confirm(`Are you sure you want to delete "${location}"?`)) {
            dispatch({ type: 'DELETE_LOCATION', payload: location });
        }
    };

    const handleAddMealType = () => {
        const price = parseFloat(newMealPrice);
        if (!newMealType.trim()) {
            setMealTypeError('Meal type name cannot be empty.');
            return;
        }
        if (state.mealTypes.some(mt => mt.toLowerCase() === newMealType.trim().toLowerCase())) {
            setMealTypeError('This meal type already exists.');
            return;
        }
        if (isNaN(price) || price < 0) {
            setMealTypeError('Please enter a valid, non-negative price.');
            return;
        }
        setMealTypeError('');
        dispatch({ type: 'ADD_MEAL_TYPE', payload: { name: newMealType.trim(), price } });
        setNewMealType('');
        setNewMealPrice('');
    };

    const handleDeleteMealType = (mealType: string) => {
        if (window.confirm(`Are you sure you want to delete "${mealType}"? Tokens already issued with this type will be preserved.`)) {
            dispatch({ type: 'DELETE_MEAL_TYPE', payload: mealType });
        }
    };
    
    const handleUpdatePrice = (name: string, price: string) => {
        const numericPrice = parseFloat(price);
        if (!isNaN(numericPrice) && numericPrice >= 0) {
            dispatch({ type: 'UPDATE_MEAL_PRICE', payload: { name, price: numericPrice } });
        }
    };
    
    const handleAddFreeReason = () => {
        if (!newFreeReason.trim()) {
            setFreeReasonError('Reason cannot be empty.');
            return;
        }
        if (state.commonFreeReasons.some(r => r.toLowerCase() === newFreeReason.trim().toLowerCase())) {
            setFreeReasonError('This reason already exists.');
            return;
        }
        setFreeReasonError('');
        dispatch({ type: 'ADD_FREE_REASON', payload: newFreeReason.trim() });
        setNewFreeReason('');
    };

    const handleDeleteFreeReason = (reason: string) => {
        if (window.confirm(`Are you sure you want to delete the reason "${reason}"?`)) {
            dispatch({ type: 'DELETE_FREE_REASON', payload: reason });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Application Settings</CardTitle>
                    <CardDescription>Manage master lists used throughout the application.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {/* Location Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Manage Locations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex space-x-2 mb-4">
                                <Input
                                    value={newLocation}
                                    onChange={(e) => setNewLocation(e.target.value)}
                                    placeholder="Enter new location name"
                                    className="flex-grow"
                                />
                                <Button onClick={handleAddLocation}>
                                    <PlusIcon className="mr-2" /> Add
                                </Button>
                            </div>
                            {locationError && <p className="text-red-500 text-sm mb-4">{locationError}</p>}
                            <div className="border rounded-lg max-h-60 overflow-y-auto">
                                <ul className="divide-y">
                                    {state.locations.map(location => (
                                        <li key={location} className="p-3 flex justify-between items-center hover:bg-slate-50">
                                            <span>{location}</span>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteLocation(location)}><TrashIcon /></Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Free Reasons Management */}
                    <Card>
                        <CardHeader>
                             <CardTitle className="text-xl">Manage Common Free Reasons</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex space-x-2 mb-4">
                                <Input
                                    value={newFreeReason}
                                    onChange={(e) => setNewFreeReason(e.target.value)}
                                    placeholder="Enter new reason"
                                    className="flex-grow"
                                />
                                <Button onClick={handleAddFreeReason}>
                                    <PlusIcon className="mr-2" /> Add
                                </Button>
                            </div>
                            {freeReasonError && <p className="text-red-500 text-sm mb-4">{freeReasonError}</p>}
                            <div className="border rounded-lg max-h-60 overflow-y-auto">
                                <ul className="divide-y">
                                    {state.commonFreeReasons.map(reason => (
                                        <li key={reason} className="p-3 flex justify-between items-center hover:bg-slate-50">
                                            <span>{reason}</span>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteFreeReason(reason)}><TrashIcon /></Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Meal Types Management */}
                <Card>
                     <CardHeader>
                         <CardTitle className="text-xl">Manage Meal Types & Prices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg mb-4 max-h-96 overflow-y-auto">
                            <ul className="divide-y">
                                {state.mealTypes.map(mealType => (
                                    <li key={mealType} className="p-3 grid grid-cols-3 gap-2 items-center hover:bg-slate-50">
                                        <span className="col-span-1 font-medium">{mealType}</span>
                                        <div className="col-span-1">
                                            <Label htmlFor={`price-${mealType}`} className="sr-only">Price for {mealType}</Label>
                                            <Input
                                                id={`price-${mealType}`}
                                                type="number"
                                                value={state.mealPrices[mealType] || ''}
                                                onChange={(e) => handleUpdatePrice(mealType, e.target.value)}
                                                placeholder="Price (₹)"
                                                className="h-9"
                                            />
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteMealType(mealType)}><TrashIcon /></Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-2 pt-4 border-t">
                             <h4 className="text-md font-semibold">Add New Meal Type</h4>
                             <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                <Input value={newMealType} onChange={e => setNewMealType(e.target.value)} placeholder="Meal name (e.g., Snacks)" />
                                <Input value={newMealPrice} onChange={e => setNewMealPrice(e.target.value)} type="number" placeholder="Price (₹)" />
                            </div>
                            {mealTypeError && <p className="text-red-500 text-sm">{mealTypeError}</p>}
                            <div className="text-right pt-2">
                                <Button onClick={handleAddMealType}><PlusIcon className="mr-2"/>Add Meal Type</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Settings;