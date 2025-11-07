
import React, { useState } from 'react';
import { Card, CardContent } from './ui/Card';
import DailySummary from './reports/DailySummary';
import InstitutionReport from './reports/InstitutionReport';
import ReasonReport from './reports/ReasonReport';
import AllTokensReport from './reports/AllTokensReport';
import AdvancedReport from './reports/AdvancedReport';
import { NavButton } from './ui/NavButton';

type ReportView = 'advanced' | 'daily' | 'institution' | 'reason' | 'all';

const ReportsDashboard: React.FC = () => {
    const [reportView, setReportView] = useState<ReportView>('advanced');

    const renderReport = () => {
        switch (reportView) {
            case 'advanced':
                return <AdvancedReport />;
            case 'daily':
                return <DailySummary />;
            case 'institution':
                return <InstitutionReport />;
            case 'reason':
                return <ReasonReport />;
            case 'all':
                return <AllTokensReport />;
            default:
                return <AdvancedReport />;
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        <NavButton size="sm" onClick={() => setReportView('advanced')} isActive={reportView === 'advanced'}>Advanced Report</NavButton>
                        <NavButton size="sm" onClick={() => setReportView('daily')} isActive={reportView === 'daily'}>Daily Summary</NavButton>
                        <NavButton size="sm" onClick={() => setReportView('institution')} isActive={reportView === 'institution'}>Institution-Wise</NavButton>
                        <NavButton size="sm" onClick={() => setReportView('reason')} isActive={reportView === 'reason'}>Reason-Wise (Free)</NavButton>
                        <NavButton size="sm" onClick={() => setReportView('all')} isActive={reportView === 'all'}>View All Tokens</NavButton>
                    </div>
                </CardContent>
            </Card>
            <div>
                {renderReport()}
            </div>
        </div>
    );
};

export default ReportsDashboard;
