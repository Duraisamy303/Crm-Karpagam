import React from 'react';
import CustomSelect from './Select';
import { useSetState } from '@/utils/functions.utils';
import IconLoader from './Icon/IconLoader';
import NumberInput from './NumberInput';
import CustomeDatePicker from '@/common_component/datePicker';

export default function QuickEditOpp(props) {
    const { collapse } = props;
    const [state, setState] = useSetState({});
    return (
        <>
           <h2 className='font-bold underline pb-3'>QUICK EDIT</h2>
            <div>
                <div className="flex  gap-3 ">
                <CustomSelect
                        title="Lead"
                        value={state.vertical}
                        onChange={(e) => {
                            if (e) {
                                setState({ focus_segment: '', vertical: e });
                            } else {
                                setState({ focus_segment: '', vertical: '' });
                            }
                        }}
                        placeholder="Lead"
                        options={state.verticalList}
                        error={state.errors?.vertical}
                    />
                    <CustomSelect
                        title="Opportunity Name"
                        value={state.vertical}
                        onChange={(e) => {
                            if (e) {
                                setState({ focus_segment: '', vertical: e });
                            } else {
                                setState({ focus_segment: '', vertical: '' });
                            }
                        }}
                        placeholder="Opportunity Name"
                        options={state.verticalList}
                        error={state.errors?.vertical}
                    />
                    {/* <CustomSelect
                    title="Date"
                    value={state.vertical}
                    onChange={(e) => {
                        if (e) {
                            setState({ focus_segment: '', vertical: e });
                        } else {
                            setState({ focus_segment: '', vertical: '' });
                        }
                    }}
                    placeholder="Date"

                    options={state.verticalList}
                    error={state.errors?.vertical}
                /> */}
                    <CustomeDatePicker error={state.errors?.closing_date} value={state.opp_closing_date} placeholder="Date" title="Date" onChange={(e) => setState({ opp_closing_date: e })} />
                    <CustomSelect
                        title="Stage"
                        value={state.vertical}
                        onChange={(e) => {
                            if (e) {
                                setState({ focus_segment: '', vertical: e });
                            } else {
                                setState({ focus_segment: '', vertical: '' });
                            }
                        }}
                        placeholder={'Stage'}
                        options={state.verticalList}
                        error={state.errors?.vertical}
                    />

                   
                </div>
                <div className="flex  gap-3 pt-5">
                    <button type="button" className="btn btn-outline-danger border " onClick={() => collapse()}>
                        Cancel
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => {}}>
                        {state.submitLoad ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                    </button>
                </div>
            </div>
            </>
    );
}
