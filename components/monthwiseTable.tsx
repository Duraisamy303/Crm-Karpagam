import { useState, useEffect } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { Badge, Group, Progress, Text, ActionIcon, Box, TextInput } from '@mantine/core';
import IconSearch from './Icon/IconSearch';
import IconX from './Icon/IconX';

const AdvancedMonthWiseLeadTable = () => {
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'month',
        direction: 'asc',
    });

    const [page, setPage] = useState(1);
    const [records, setRecords] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const pageSize = 8;

    const monthlyData = [
        {
            id: 1,
            month: 'January 2024',
            totalLeads: 45,
            wonLeads: 32,
            conversionRate: 71,
            revenue: 1250000,
            target: 1500000,
            status: 'exceeded',
            trend: 'up',
        },
        {
            id: 2,
            month: 'February 2024',
            totalLeads: 38,
            wonLeads: 28,
            conversionRate: 74,
            revenue: 1100000,
            target: 1200000,
            status: 'achieved',
            trend: 'up',
        },
        {
            id: 3,
            month: 'March 2024',
            totalLeads: 52,
            wonLeads: 35,
            conversionRate: 67,
            revenue: 1450000,
            target: 1400000,
            status: 'exceeded',
            trend: 'down',
        },
        {
            id: 4,
            month: 'April 2024',
            totalLeads: 41,
            wonLeads: 25,
            conversionRate: 61,
            revenue: 980000,
            target: 1300000,
            status: 'pending',
            trend: 'down',
        },
        {
            id: 5,
            month: 'May 2024',
            totalLeads: 48,
            wonLeads: 38,
            conversionRate: 79,
            revenue: 1650000,
            target: 1600000,
            status: 'exceeded',
            trend: 'up',
        },
        {
            id: 6,
            month: 'June 2024',
            totalLeads: 36,
            wonLeads: 22,
            conversionRate: 61,
            revenue: 890000,
            target: 1100000,
            status: 'pending',
            trend: 'down',
        },
        {
            id: 7,
            month: 'July 2024',
            totalLeads: 55,
            wonLeads: 42,
            conversionRate: 76,
            revenue: 1820000,
            target: 1700000,
            status: 'exceeded',
            trend: 'up',
        },
        {
            id: 8,
            month: 'August 2024',
            totalLeads: 42,
            wonLeads: 31,
            conversionRate: 74,
            revenue: 1380000,
            target: 1450000,
            status: 'achieved',
            trend: 'up',
        },
        {
            id: 9,
            month: 'September 2024',
            totalLeads: 39,
            wonLeads: 26,
            conversionRate: 67,
            revenue: 1150000,
            target: 1350000,
            status: 'pending',
            trend: 'down',
        },
        {
            id: 10,
            month: 'October 2024',
            totalLeads: 51,
            wonLeads: 39,
            conversionRate: 76,
            revenue: 1680000,
            target: 1550000,
            status: 'exceeded',
            trend: 'up',
        },
    ];

    useEffect(() => {
        let filteredData = monthlyData;

        // Apply search filter
        if (searchQuery) {
            filteredData = monthlyData.filter((item) => item.month.toLowerCase().includes(searchQuery.toLowerCase()) || item.status.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        // Apply sorting
        const sortedData = filteredData.sort((a, b) => {
            const aValue = a[sortStatus.columnAccessor as keyof typeof a];
            const bValue = b[sortStatus.columnAccessor as keyof typeof b];

            if (sortStatus.direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            }
            return aValue < bValue ? 1 : -1;
        });

        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords(sortedData.slice(from, to));
    }, [page, sortStatus, searchQuery]);

    const formatIndianRupees = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="panel mt-6">
            <div className="mb-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-dark dark:text-white-light">Month-wise Lead Performance</h3>
                        <p className="text-gray-600 dark:text-gray-400">Detailed overview of monthly lead conversions</p>
                    </div>

                    <TextInput
                        placeholder="Search months..."
                        rightSection={
                            searchQuery && (
                                <ActionIcon size="sm" onClick={() => setSearchQuery('')}>
                                </ActionIcon>
                            )
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                        className="w-full lg:w-64"
                    />
                </div>
            </div>

            <DataTable
                withColumnBorders
                striped
                highlightOnHover
                records={records}
                columns={[
                    {
                        accessor: 'month',
                        title: 'Month',
                        sortable: true,
                        width: 150,
                    },
                    {
                        accessor: 'leads',
                        title: 'Leads',
                        sortable: true,
                        render: ({ wonLeads, totalLeads }) => (
                            <Group >
                                <Text fw={600}>{wonLeads}</Text>
                                <Text c="dimmed" size="sm">
                                    / {totalLeads}
                                </Text>
                            </Group>
                        ),
                    },
                    {
                        accessor: 'conversion',
                        title: 'Conversion',
                        sortable: true,
                        render: ({ conversionRate }) => (
                            <Box w={100}>
                                <Progress value={conversionRate} color={conversionRate >= 75 ? 'green' : conversionRate >= 60 ? 'blue' : 'orange'} size="sm" />
                                <Text size="sm" ta="center" mt={5}>
                                    {conversionRate}%
                                </Text>
                            </Box>
                        ),
                    },
                    {
                        accessor: 'revenue',
                        title: 'Revenue',
                        sortable: true,
                        render: ({ revenue }) => (
                            <Text fw={600} size="sm">
                                {formatIndianRupees(revenue)}
                            </Text>
                        ),
                    },
                    {
                        accessor: 'performance',
                        title: 'Performance',
                        sortable: true,
                        render: ({ revenue, target }) => {
                            const percentage = (revenue / target) * 100;
                            const color = percentage >= 100 ? 'green' : percentage >= 80 ? 'yellow' : 'red';
                            return (
                                <Group >
                                    <Progress value={Math.min(percentage, 100)} color={color} size="sm" w={60} />
                                    <Text size="sm" fw={500} c={color}>
                                        {percentage.toFixed(0)}%
                                    </Text>
                                </Group>
                            );
                        },
                    },
                    {
                        accessor: 'status',
                        title: 'Status',
                        sortable: true,
                        render: ({ status }) => (
                            <Badge color={status === 'exceeded' ? 'green' : status === 'achieved' ? 'blue' : 'orange'} variant="light">
                                {status === 'exceeded' ? 'Exceeded' : status === 'achieved' ? 'Achieved' : 'Below Target'}
                            </Badge>
                        ),
                    },
                ]}
                sortStatus={sortStatus}
                onSortStatusChange={setSortStatus}
                totalRecords={monthlyData.length}
                recordsPerPage={pageSize}
                page={page}
                onPageChange={setPage}
                paginationText={({ from, to, totalRecords }) => `Showing ${from} - ${to} of ${totalRecords} months`}
            />
        </div>
    );
};

export default AdvancedMonthWiseLeadTable;
