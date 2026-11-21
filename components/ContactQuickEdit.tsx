import React, { useEffect } from 'react';
import CustomSelect from './Select';
import { Dropdown, Success, objIsEmpty, useSetState } from '@/utils/functions.utils';
import IconLoader from './Icon/IconLoader';
import NumberInput from './NumberInput';
import CustomeDatePicker from '@/common_component/datePicker';
import Models from '@/imports/models.import';
import moment from 'moment';
import TextArea from './TextArea';
import CheckboxInput from './Checkbox';

export default function ContactQuickEdit(props) {
    const { collapse, data, updateList, resetExpandedRow } = props;
    const [state, setState] = useSetState({
        statusList: [],
        moveToLead: false,
        status: null,
        is_archive: false,
        remark: null,
        currentLeadPage: 1,
    });

    useEffect(() => {
        statusList();
        assignData();
        // leadList();
    }, []);

    // useEffect(() => {
    //     if (state.assignRole) {
    //         if (state.assignRole?.value == 'Admin') {
    //             ownerList();
    //         } else if (state.assignRole?.value == 'BDM') {
    //             bdmList();
    //         } else if (state.assignRole?.value == 'BDE') {
    //             bdeList();
    //         } else if (state.assignRole?.value == 'TM') {
    //             telecallerList();
    //         }
    //     }
    // }, [state.assignRole]);

    // const ownerList = async () => {
    //     try {
    //         const res: any = await Models.lead.ownerList();
    //         const dropdownList = Dropdown(res?.results, 'full_name');
    //         setState({ assignList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });
    //         console.log('error: ', error);
    //     }
    // };

    // const bdmList = async () => {
    //     try {
    //         const res: any = await Models.lead.bdmList();
    //         const dropdownList = Dropdown(res?.results, 'full_name');
    //         setState({ assignList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });
    //         console.log('error: ', error);
    //     }
    // };

    // const bdeList = async () => {
    //     try {
    //         const res: any = await Models.lead.bdeList();
    //         const dropdownList = Dropdown(res?.results, 'full_name');
    //         setState({ assignList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });
    //         console.log('error: ', error);
    //     }
    // };

    // const telecallerList = async () => {
    //     try {
    //         setState({ loading: true });
    //         const res: any = await Models.lead.bdmAndBDE();
    //         const dropdownList = Dropdown(res?.results, 'full_name');
    //         setState({ assignList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });
    //         console.log('error: ', error);
    //     }
    // };

    const statusList = async () => {
        try {
            setState({ loading: true });
            const res = await Models.contact.status();
            const dropdownList = Dropdown(res, 'status');
            setState({ statusList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    // const leadList = async () => {
    //     try {
    //         const res: any = await Models.lead.list(state.currentLeadPage);
    //         const dropdownList = Dropdown(res?.results, 'name');
    //         setState({
    //             leadList: dropdownList,
    //             hasMoreLead: res.next,
    //         });
    //     } catch (error) {
    //         console.log('error: ', error);
    //     }
    // };

    // const leadListLoadMore = async () => {
    //     try {
    //         if (state.hasMoreLead) {
    //             const res: any = await Models.lead.list(state.currentLeadPage + 1);
    //             const newOptions = Dropdown(res?.results, 'name');
    //             setState({
    //                 leadList: [...state.leadList, ...newOptions],
    //                 hasMoreLead: res.next,
    //                 currentLeadPage: state.currentLeadPage + 1,
    //             });
    //         } else {
    //             setState({
    //                 leadList: state.leadList,
    //             });
    //         }
    //     } catch (error) {
    //         console.log('error: ', error);
    //     }
    // };

    const assignData = async () => {
        try {
            setState({
                status: objIsEmpty(data?.allData?.status) ? null : { value: data?.allData?.status?.id, label: data?.allData?.status?.status },
                remark: data?.remark,
                moveToLead: objIsEmpty(data?.lead) ? false : true,
                is_archive: data?.is_archive,
                lead: objIsEmpty(data?.lead) ? null : { value: data?.lead?.id, label: data?.lead?.name },
                assignRole: objIsEmpty(data?.assigned_to) ? null : { value: data?.assigned_to?.groups?.[0], label: data?.assigned_to?.groups?.[0] },
                assigned_to: objIsEmpty(data?.assigned_to) ? null : { value: data?.assigned_to?.id, label: `${data?.assigned_to?.first_name} ${data?.assigned_to?.last_name} ` },
            });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const updateContact = async () => {
        try {
            setState({ submitLoad: true });
            const body = {
                status: state.status?.value,
                remark: state?.remark,
                lead: state.moveToLead ? state.lead?.value : null,
                is_archive: state.is_archive,
                assigned_to: state.assigned_to?.value,
            };

            const res: any = await Models.contact.update(body, data?.id);
            setState({ submitLoad: false });
            Success('Contact updated successfully');
            updateList();
            collapse();
        } catch (error) {
            setState({ submitLoad: false });
        }
    };

    const cancelQuickEdit = () => {
        resetExpandedRow(); // Reset the expandedRow to null
        collapse(); // Collapse the row
    };

    return (
        <>
            <h2 className="pb-3 text-lg  underline">QUICK EDIT</h2>
            <div className="w-full">
                {/* Input Section */}
                <div className="flex  gap-3">
                    <CustomSelect
                        value={state.assignRole}
                        onChange={(e) => setState({ assignRole: e, assigned_to: '', assignList: [] })}
                        placeholder={'Choose Role'}
                        title={'Choose Role'}
                        options={[
                            { value: 'Admin', label: 'Admin' },
                            { value: 'BDM', label: 'BDM' },
                            { value: 'BDE', label: 'BDE' },
                            { value: 'TM', label: 'TM' },
                        ]}
                    />
                    <CustomSelect
                        title="Assigned To"
                        value={state.assigned_to}
                        onChange={(e) => {
                            setState({ assigned_to: e });
                        }}
                        placeholder={'Assigned To'}
                        options={state.assignList}
                    />
                    <TextArea title="Remark" height="120px" value={state.remark} onChange={(e) => setState({ remark: e })} placeholder={'Remark'} />

                    <CustomSelect
                        title="Status"
                        value={state.status}
                        onChange={(e) => {
                            setState({ status: e });
                        }}
                        placeholder={'Status'}
                        options={state.statusList}
                    />
                    <div className=" flex  w-full flex-col gap-3 md:w-1/2 lg:w-3/4">
                        {/* <CheckboxInput className="w-full md:w-1/2 lg:w-3/4" checked={state.moveToLead} onChange={(val) => setState({ moveToLead: val })} label="Move To Lead" />
                        {state.moveToLead && (
                            <CustomSelect
                                title="Lead"
                                value={state.lead}
                                onChange={(e) => {
                                    setState({ lead: e });
                                }}
                                placeholder={'Lead'}
                                options={state.leadList}
                                loadMore={() => leadListLoadMore()}
                            />
                        )} */}
                        <CheckboxInput className="w-full md:w-1/2 lg:w-3/4" checked={state.is_archive} onChange={(val) => setState({ is_archive: val })} label="Archive Contact" />
                    </div>
                </div>

                {/* Button Section */}
                <div className="flex flex-col gap-3 pt-5 md:flex-row md:justify-end">
                    <button type="button" className="btn btn-outline-danger w-full border md:w-auto" onClick={cancelQuickEdit}>
                        Cancel
                    </button>
                    <button type="button" className="btn btn-primary w-full md:w-auto" onClick={() => updateContact()}>
                        {state.submitLoad ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                    </button>
                </div>
            </div>
        </>
    );
}
