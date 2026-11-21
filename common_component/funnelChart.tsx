import React, { Component } from 'react';

import { FunnelChart } from 'react-funnel-pipeline';
import 'react-funnel-pipeline/dist/index.css';

export default function Funnel(props: any) {
    const { data, height, width } = props;
    return <FunnelChart chartWidth={width ? width : 600} chartHeight={height ? height : 300} data={data} />;
}
