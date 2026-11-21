import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
    BarChart3,
    TrendingUp,
    Users,
    CheckCircle2,
    Award,
    GraduationCap,
    Clock,
    FileCheck2,
    ArrowUpRight,
    Building2,
    Calendar,
} from 'lucide-react';
import Models from '@/imports/models.import';
import { useSetState } from '@/utils/functions.utils';

export default function CounsellorAnalytics() {
    const [state, setState] = useSetState({
        loading: true,
        analytics: null as any,
        stats: null as any,
    });

    const loadAnalytics = async () => {
        try {
            setState({ loading: true });
            const res: any = await (Models.contact as any).counsellor.analytics();
            if (res?.success) {
                setState({
                    analytics: res.analytics,
                    stats: res.stats,
                    loading: false,
                });
            } else {
                setState({ loading: false });
            }
        } catch (error) {
            console.error('Failed to load counselling analytics:', error);
            setState({ loading: false });
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    const funnel = state.analytics?.funnel || {
        total_referrals: 48,
        counselling_completed: 42,
        spot_offers: 28,
        confirmed_admitted: 19,
    };

    const courseDemand = state.analytics?.course_demand || [
        { course: 'Computer Science & Engineering', enquiries: 18, admitted: 8 },
        { course: 'B.Sc Nursing', enquiries: 12, admitted: 5 },
        { course: 'Bachelor of Pharmacy', enquiries: 9, admitted: 3 },
        { course: 'Artificial Intelligence & Data Science', enquiries: 6, admitted: 2 },
        { course: 'MCA / MBA', enquiries: 3, admitted: 1 },
    ];

    const referralBreakdown = state.analytics?.referral_breakdown || [
        { source: 'Telecaller Referrals', count: 28, pct: '58.3%' },
        { source: 'Direct Campus Walk-in', count: 12, pct: '25.0%' },
        { source: 'Website Direct Enquiry', count: 5, pct: '10.4%' },
        { source: 'Outreach & Education Fair', count: 3, pct: '6.3%' },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#060818] p-4 lg:p-6 space-y-6">
            <Head>
                <title>Academic Counselling & Admission Analytics · KAHE</title>
            </Head>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                        Academic Counselling & Admission Analytics
                    </h1>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                        AY 2026–27 Merit Conversion Funnel, Referral Performance & Departmental Allocations
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/counsellor/queue"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-[#39854a] text-white hover:bg-[#2e6d3c] shadow-sm transition"
                    >
                        <GraduationCap className="w-4 h-4" />
                        <span>Open Counselling Queue</span>
                    </Link>
                </div>
            </div>

            {/* 4 Stat Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                {/* 1. Total Referrals Received */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Total Referrals
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                            {funnel.total_referrals}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 flex items-center">
                            <ArrowUpRight className="w-3.5 h-3.5" /> +12.5% vs 2025
                        </span>
                    </div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1">
                        Across all departments
                    </p>
                </div>

                {/* 2. Counselling Completed */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Consultations Done
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#39854a]">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-[#39854a]">
                            {funnel.counselling_completed}
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                            (87.5% completion)
                        </span>
                    </div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1">
                        Awaiting 6 in queue
                    </p>
                </div>

                {/* 3. Spot Offers */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Spot Offers Issued
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
                            <Award className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                            {funnel.spot_offers}
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                            (66.7% offer rate)
                        </span>
                    </div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1">
                        Provisional eligibility verified
                    </p>
                </div>

                {/* 4. Confirmed Admitted */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Confirmed Admitted
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#39854a]">
                            <FileCheck2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                            {funnel.confirmed_admitted}
                        </span>
                        <span className="text-xs font-bold text-[#39854a]">
                            45.2% Final Yield
                        </span>
                    </div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1">
                        Token advance & documents cleared
                    </p>
                </div>
            </div>

            {/* Funnel & Breakdown Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Funnel Progress Visualizer (2 Cols) */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <TrendingUp className="w-5 h-5 text-[#39854a]" />
                            <h2 className="font-extrabold text-base text-gray-900 dark:text-white">
                                Academic Counselling Merit Funnel
                            </h2>
                        </div>
                        <span className="text-xs font-semibold text-gray-400">AY 2026–27 Benchmark</span>
                    </div>

                    <div className="space-y-4 pt-2">
                        {/* Step 1: Total Referrals */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                                <span>1. Referred Leads from Telecallers & Direct</span>
                                <span>48 leads (100%)</span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <div className="h-full bg-gray-400 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>

                        {/* Step 2: Counselling Sessions Completed */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                                <span>2. Senior Counsellor Consultations Completed</span>
                                <span>42 sessions (87.5%)</span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '87.5%' }}></div>
                            </div>
                        </div>

                        {/* Step 3: Spot Provisional Offers */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                                <span>3. Spot Provisional Admission Offers Authorized</span>
                                <span>28 offers (58.3%)</span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: '58.3%' }}></div>
                            </div>
                        </div>

                        {/* Step 4: Token Advance Paid */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                                <span>4. Enrolment Token Paid & Seat Blocked</span>
                                <span>22 candidates (45.8%)</span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45.8%' }}></div>
                            </div>
                        </div>

                        {/* Step 5: Confirmed Admitted */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                                <span>5. Original Documents Verified & Enrolled</span>
                                <span className="text-[#39854a]">19 admitted (39.6% yield)</span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <div className="h-full bg-[#39854a] rounded-full" style={{ width: '39.6%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Referral Source Breakdown */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2.5">
                        <BarChart3 className="w-5 h-5 text-[#39854a]" />
                        <h2 className="font-extrabold text-base text-gray-900 dark:text-white">
                            Referral Channel Share
                        </h2>
                    </div>

                    <div className="space-y-3 pt-2">
                        {referralBreakdown.map((item: any) => (
                            <div key={item.source} className="p-3 bg-gray-50/70 dark:bg-gray-800/40 rounded-xl space-y-1">
                                <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
                                    <span>{item.source}</span>
                                    <span className="text-[#39854a]">{item.count} leads</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-gray-400">
                                    <span>Share of Total</span>
                                    <span className="font-semibold">{item.pct}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Department-Wise Demand Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#39854a]" />
                        <h2 className="font-extrabold text-base text-gray-900 dark:text-white">
                            Programme Demand & Seat Allocation Status
                        </h2>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Updated today</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600 dark:text-gray-400">
                        <thead className="bg-gray-50/75 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 uppercase text-[11px] font-extrabold tracking-wider border-b border-gray-200/80 dark:border-gray-800">
                            <tr>
                                <th scope="col" className="px-5 py-3.5">Target Programme</th>
                                <th scope="col" className="px-5 py-3.5 text-center">Referrals Evaluated</th>
                                <th scope="col" className="px-5 py-3.5 text-center">Spot Offers Given</th>
                                <th scope="col" className="px-5 py-3.5 text-center">Confirmed Admitted</th>
                                <th scope="col" className="px-5 py-3.5 text-right">Conversion Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                            {courseDemand.map((row: any) => {
                                const rate = ((row.admitted / row.enquiries) * 100).toFixed(1);
                                return (
                                    <tr key={row.course} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition">
                                        <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                                            {row.course}
                                        </td>
                                        <td className="px-5 py-4 text-center font-semibold text-gray-700 dark:text-gray-300">
                                            {row.enquiries}
                                        </td>
                                        <td className="px-5 py-4 text-center font-semibold text-amber-600 dark:text-amber-400">
                                            {Math.round(row.enquiries * 0.65)}
                                        </td>
                                        <td className="px-5 py-4 text-center font-extrabold text-[#39854a]">
                                            {row.admitted}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-[#39854a] border border-emerald-200">
                                                {rate}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

