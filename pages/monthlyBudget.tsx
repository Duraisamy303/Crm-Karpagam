import React from 'react';
import { useRouter } from 'next/router';
import ViewLabel from '@/components/viewLabel';

export default function MonthlyBudget() {
    const router = useRouter();
    const id = "example-id"; // Replace with actual id or state

    return (
        <div className=" panel ">
            <div className="p-2 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 lg:mr-10">
                    <div className="flex items-center gap-5">
                        <div className="text-3xl font-bold">Zylker Trade Show - 2019</div>
                        <div className="text-md bg-slate-200 px-2 py-1 font-semibold rounded">Follow</div>
                    </div>
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => router.push(`/updateLead?id=${id}`)}
                    >
                        Edit
                    </button>
                </div>

                {/* Campaign Details */}
                <div className="mt-5 flex flex-col gap-2 md:w-2/5">
                    <ViewLabel text="text-lg" label="Campaign Owner" value="Laurel Evans" />
                    <ViewLabel text="text-lg" label="Type" value="Trade Show" />
                    <ViewLabel text="text-lg" label="Status" value="Completed" />
                </div>

                {/* Campaign Information */}
                <div className="mt-8 space-y-4">
                    <div className="text-xl font-bold">Campaign Information</div>
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {[
                                { label: 'Campaign Owner', value: 'Laurel Evans' },
                                { label: 'Campaign Name', value: 'Zylker Trade Show 2019' },
                                { label: 'Start Date', value: 'May 2, 2019' },
                                { label: 'Expected Revenue', value: '$ 50,000.00' },
                                { label: 'Actual Cost', value: '$ 20,000.00' },
                                { label: 'Num sent', value: '' },
                                { label: 'Attended', value: 'Yes' },
                                { label: 'Modified By', value: 'Tracy Smith' },
                                { label: 'Exchange Rate', value: '10' },
                            ].map((item, index) => (
                                <div key={index}>
                                    <ViewLabel text="text-lg" label={item.label} value={item.value} />
                                    <hr className="w-[80%]" />
                                </div>
                            ))}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {[
                                { label: 'Type', value: 'Trade Show' },
                                { label: 'Status', value: 'Completed' },
                                { label: 'End Date', value: 'May 2, 2019' },
                                { label: 'Budgeted Cost', value: '$ 50,000.00' },
                                { label: 'Expected Response', value: '$ 20,000.00' },
                                { label: 'Created By', value: '' },
                                { label: 'Currency', value: 'USD' },
                            ].map((item, index) => (
                                <div key={index}>
                                    <ViewLabel text="text-lg" label={item.label} value={item.value} />
                                    <hr className="w-[80%]" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
