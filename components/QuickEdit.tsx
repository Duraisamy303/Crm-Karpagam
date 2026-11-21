import React, { useEffect } from 'react';
import CustomSelect from './Select';
import { capitalizeFLetter, Dropdown, objIsEmpty, Success, useSetState } from '@/utils/functions.utils';
import IconLoader from './Icon/IconLoader';
import NumberInput from './NumberInput';
import CustomeDatePicker from '@/common_component/datePicker';
import Models from '@/imports/models.import';
import moment from 'moment';
import { ROLE } from '@/utils/constant.utils';

export default function QuickEdit(props) {
    const { collapse, data, statusList, updateList, id, resetExpandedRow } = props;
    const [state, setState] = useSetState({
        assignList: [],
        followUp: null,
        status: null,
        department: null,
        departmentList: [],
        assigned_to: null,
    });

    useEffect(() => {
        assignData();
    }, []);

    const assignData = async () => {
        try {
            const arrgnedRole = data?.assign_to?.groups?.length > 0 ? (data?.assign_to?.groups?.[0] == 1 ? { value: 'admin', label: 'Admin' } : { value: 'staff', label: 'Staff' }) : null;
            setState({ assignRole: arrgnedRole });

            setState({
                follow_up: data?.best_time_to_contact ? data?.best_time_to_contact : null,
                assign_to: !objIsEmpty(data?.assign_to)
                    ? { value: data?.assign_to?.id, label: `${capitalizeFLetter(data?.assign_to?.first_name)} ${capitalizeFLetter(data?.assign_to?.last_name)}` }
                    : null,
            });
            if (data?.assign_to) {
                if (data?.assign_to?.groups?.length > 0) {
                    data?.assign_to?.groups?.[0] == 1 ? initialUsersList('Admin') : initialUsersList('Staff');
                }
            }
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const initialUsersList = async (e) => {
        try {
            setState({ userLoading: true });
            let body: any = {};
            if (e == ROLE.ADMIN) {
                body.show_admins_only = 'Yes';
            } else {
                body.exclude_admin = 'Yes';
            }

            const res: any = await Models.user.includeAdminuserList(1, body);
            const dropdownList = res?.results?.map((item) => ({
                label: `${capitalizeFLetter(item?.first_name)} ${capitalizeFLetter(item?.last_name)}`,
                value: item?.id,
            }));

            setState({ usersList: dropdownList, userLoading: false, userPage: 1, userHasNext: res?.next });
        } catch (error) {
            setState({ userLoading: false });
            console.log('error: ', error);
        }
    };

    const updateLead = async () => {
        try {
            setState({ submitLoad: true });
            const body = {
                assign_to: state.assign_to?.value,
                best_time_to_contact: state.best_time_to_contact,
            };
            const res: any = await Models.lead.update(body, data?.id);
            setState({ submitLoad: false });
            Success('Lead updated successfully');
            updateList();
        } catch (error) {
            setState({ submitLoad: false });
        }
    };

    const cancelQuickEdit = () => {
        resetExpandedRow(); // Reset the expandedRow to null
        collapse(); // Collapse the row
    };

    const usersList = async (e) => {
        try {
            setState({ assignRole: e, assign_to: null });
            setState({ userLoading: true });
            let body: any = {};
            if (e?.label == ROLE.ADMIN) {
                body.show_admins_only = 'Yes';
            } else {
                body.exclude_admin = 'Yes';
            }

            const res: any = await Models.user.includeAdminuserList(1, body);
            const dropdownList = res?.results?.map((item) => ({
                label: `${capitalizeFLetter(item?.first_name)} ${capitalizeFLetter(item?.last_name)}`,
                value: item?.id,
            }));

            setState({ usersList: dropdownList, userLoading: false, userPage: 1, userHasNext: res?.next });
        } catch (error) {
            setState({ userLoading: false });
            console.log('error: ', error);
        }
    };

    const usersListLoadMore = async () => {
        try {
            setState({ userloadMore: true });
            let body: any = {};
            if (state.assignRole?.label == ROLE.ADMIN) {
                body.show_admins_only = 'Yes';
            } else {
                body.exclude_admin = 'Yes';
            }

            const res: any = await Models.user.includeAdminuserList(1, body);

            const dropdownList = res?.results?.map((item) => ({
                label: `${capitalizeFLetter(item?.first_name)} ${capitalizeFLetter(item?.last_name)}`,
                value: item?.id,
            }));

            setState({
                usersList: [...state.usersList, ...dropdownList],
                userloadMore: false,
                userPage: state.userPage + 1,
                userHasNext: res.next,
            });
        } catch (error) {
            setState({ userloadMore: false });
            console.log('error: ', error);
        }
    };

    return (
        <>
            <h2 className="flex pb-3 text-lg font-bold underline">QUICK EDIT</h2>
            <div className="w-full ">
                {/* Input Section */}
                <div className="flex gap-3 ">
                    {/* <CustomSelect
                        title="Last Status"
                        value={state.lead_status}
                        onChange={(e) => {
                            setState({ lead_status: e });
                        }}
                        placeholder="Last Status"
                        options={statusList}
                    /> */}

                    <CustomeDatePicker value={state.follow_up} placeholder="Best Time To Contact" title="Best Time To Contact" onChange={(e) => setState({ follow_up: e })} />
                    <CustomSelect
                        value={state.assignRole}
                        onChange={(e) => {
                            usersList(e);
                        }}
                        placeholder={'Choose Role'}
                        title={'Choose Role'}
                        options={[
                            { value: 'admin', label: 'Admin' },
                            { value: 'staff', label: 'Staff' },
                        ]}
                        error={state.errors?.assignRole}
                    />
                    <CustomSelect
                        title="Assign To"
                        value={state.assign_to}
                        onChange={(e) => setState({ assign_to: e })}
                        placeholder={'Assign To'}
                        options={state.usersList}
                        error={state.errors?.assign_to}
                        isMulti={false}
                        loadMore={() => state.userHasNext && usersListLoadMore()}
                        loading={state.userloadMore || state.userLoading}
                    />

                    {/* <CustomSelect
                        title="Status"
                        value={state.lead_status}
                        onChange={(e) => {
                            setState({ lead_status: e });
                        }}
                        placeholder="Status"
                        options={statusList}
                      
                    />  */}
                </div>

                {/* Button Section */}
                <div className="flex flex-col gap-3 pt-5 md:flex-row md:justify-end">
                    <button type="button" className="btn btn-outline-danger w-full border md:w-auto" onClick={cancelQuickEdit}>
                        Cancel
                    </button>
                    <button type="button" className="btn btn-primary w-full md:w-auto" onClick={() => updateLead()}>
                        {state.submitLoad ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                    </button>
                </div>
            </div>
        </>
    );
}
