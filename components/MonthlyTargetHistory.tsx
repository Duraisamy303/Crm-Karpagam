import React, { useState, useEffect } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { Badge, Group, Text } from '@mantine/core';

const MonthlyTargetDataTable = ({ data }) => {
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'userName',
        direction: 'asc',
    });
    const [records, setRecords] = useState(data);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getMonthName = (monthNumber) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthNumber - 1] || 'Invalid Month';
    };

    useEffect(() => {
        const sortedData = [...data].sort((a, b) => {
            let aValue, bValue;

            switch (sortStatus.columnAccessor) {
                case 'userName':
                    aValue = `${a.user?.first_name} ${a.user?.last_name}`.toLowerCase();
                    bValue = `${b.user?.first_name} ${b.user?.last_name}`.toLowerCase();
                    break;
                case 'role':
                    aValue = a.user?.group?.name.toLowerCase();
                    bValue = b.user?.group?.name.toLowerCase();
                    break;
                case 'period':
                    aValue = a.year * 12 + a.month;
                    bValue = b.year * 12 + b.month;
                    break;
                case 'amount':
                    aValue = parseFloat(a.target_amount);
                    bValue = parseFloat(b.target_amount);
                    break;
                default:
                    aValue = a[sortStatus.columnAccessor];
                    bValue = b[sortStatus.columnAccessor];
            }

            if (aValue < bValue) {
                return sortStatus.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortStatus.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        setRecords(sortedData);
    }, [sortStatus, data]);

    const columns = [
        {
            accessor: 'userName',
            title: 'User Name',
            render: (record) => (
                <Group align="flex-start">
                    <div>
                        <Text fw={500} size="sm">
                            {record.user?.first_name} {record.user?.last_name}
                        </Text>
                        <Text size="xs" c="dimmed">
                            @{record.user?.username}
                        </Text>
                    </div>
                </Group>
            ),
        },
        {
            accessor: 'role',
            title: 'Role',
            render: (record) => (
                <Badge color="blue" variant="light">
                    {record.user?.group?.name}
                </Badge>
            ),
        },
        {
            accessor: 'period',
            title: 'Month Year',
            sortable: false,
            render: (record) => (
                <div>
                    <Text size="sm" fw={500}>
                        {getMonthName(record.month)}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {record.year}
                    </Text>
                </div>
            ),
        },
        {
            accessor: 'amount',
            title: 'Target Amount',
            render: (record) => (
                <Text size="sm" fw={600} c="blue">
                    {formatCurrency(record.target_amount)}
                </Text>
            ),
        },
    ];

    return (
        <DataTable
            withColumnBorders
            striped
            highlightOnHover
            records={records}
            columns={columns}
            idAccessor="id"
            minHeight={200}
            noRecordsText="No target data found"
        />
    );
};

// Usage example

export default MonthlyTargetDataTable;