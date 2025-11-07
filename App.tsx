import React, { useState } from 'react';
import IssueTokenForm from './components/IssueTokenForm';
import ReportsDashboard from './components/ReportsDashboard';
import Settings from './components/Settings';
import PaymentsDashboard from './components/PaymentsDashboard';
import { Header } from './components/Header';
import { NavButton } from './components/ui/NavButton';
import { IssueTokenIcon, ReportsIcon, SettingsIcon, PaymentsIcon } from './components/ui/Icons';

type View = 'issue' | 'reports' | 'payments' | 'settings';

const App: React.FC = () => {
    const [view, setView] = useState<View>('issue');

    const renderView = () => {
        switch (view) {
            case 'issue':
                return <IssueTokenForm />;
            case 'reports':
                return <ReportsDashboard />;
            case 'payments':
                return <PaymentsDashboard />;
            case 'settings':
                return <Settings />;
            default:
                return <IssueTokenForm />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            <Header />
            <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
                <div className="mb-6 bg-white rounded-lg shadow-sm p-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <NavButton
                        onClick={() => setView('issue')}
                        isActive={view === 'issue'}
                    >
                        <IssueTokenIcon />
                        Issue Token
                    </NavButton>
                    <NavButton
                        onClick={() => setView('reports')}
                        isActive={view === 'reports'}
                    >
                        <ReportsIcon />
                        Reports
                    </NavButton>
                    <NavButton
                        onClick={() => setView('payments')}
                        isActive={view === 'payments'}
                    >
                        <PaymentsIcon />
                        Payments
                    </NavButton>
                    <NavButton
                        onClick={() => setView('settings')}
                        isActive={view === 'settings'}
                    >
                        <SettingsIcon />
                        Settings
                    </NavButton>
                </div>
                <div>
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

export default App;