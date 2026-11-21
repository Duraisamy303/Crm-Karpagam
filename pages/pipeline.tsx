import Funnel from '@/common_component/funnelChart'
import React from 'react'

export default function Pipeline() {

    const pipelineData = [
        { name: 'Market Research', value: 30, fillColor: '#FFC300' }, // Amber
        { name: 'Team Outreach', value: 20, fillColor: '#FF5733' }, // Red Orange
        { name: 'Opportunity Review', value: 15, fillColor: '#C70039' }, // Deep Red
        { name: 'Strategy Deployment', value: 10, fillColor: '#900C3F' }, // Dark Red
        { name: 'Deal Support', value: 5, fillColor: '#581845' }, // Plum
        { name: 'Closed Deals', value: 20, fillColor: '#2E1A47' }, // Purple Black
    ];

  return (
    <div className="mt-2 flex h-[480px] flex-wrap gap-5">
    <div className="panel flex w-full flex-col items-center justify-center  p-3 ">
        <div className="mb-2 flex w-full items-center  gap-5">
            <h5 className="text-lg font-semibold dark:text-white-light">Sales Pipeline Stages</h5>
        </div>
        <Funnel data={pipelineData} />
        {/* <ReactApexChart series={stageChart.series} options={stageChart.options} className="rounded-lg bg-white dark:bg-black" type="pie" height={300} width={'100%'} /> */}
    </div>
</div>
  )
}
