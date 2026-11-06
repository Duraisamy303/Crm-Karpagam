import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { BarChart3, TrendingUp, CheckCircle, Users, PhoneCall, PieChart, Layers } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { filteredStudents, users, campaigns, institutions, activeAcademicYear } = useCrm();

  const [activeReportTab, setActiveReportTab] = useState<
    'summary' | 'performance' | 'followups' | 'funnel' | 'campaigns'
  >('summary');

  // Contact summary by Institution
  const institutionSummary = institutions.map((inst) => {
    const list = filteredStudents.filter((s) => s.preferredInstitution === inst.name);
    const interested = list.filter(
      (s) => s.interestStatus === 'High' || s.admissionStage === 'Interested'
    ).length;
    const admitted = list.filter((s) => s.admissionStage === 'Admitted').length;
    return {
      name: inst.name,
      code: inst.code,
      total: list.length,
      interested,
      admitted,
    };
  });

  // Telecaller performance
  const telecallers = users.filter((u) => u.role === 'TELECALLER');
  const performanceData = telecallers.map((tc) => {
    const assigned = filteredStudents.filter((s) => s.assignedTelecallerId === tc.id);
    const converted = assigned.filter(
      (s) => s.admissionStage === 'Admitted' || s.admissionStage === 'Applied'
    ).length;
    const calls = tc.callsToday;
    const conversionRate = assigned.length > 0 ? Math.round((converted / assigned.length) * 100) : 0;
    return {
      telecaller: tc.name,
      assignedCount: assigned.length,
      callsMade: calls,
      conversions: converted,
      conversionRate,
    };
  });

  // Admission funnel stages
  const stagesOrder = ['New', 'Contacted', 'Interested', 'Counselling', 'Applied', 'Admitted'];
  const funnelMetrics = stagesOrder.map((stage) => {
    const count = filteredStudents.filter((s) => s.admissionStage === stage).length;
    const percentage = Math.round((count / (filteredStudents.length || 1)) * 100);
    return { stage, count, percentage };
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172B20] tracking-tight">
            Admission Reports & Analytics
          </h1>
          <p className="text-xs font-semibold text-[#36473C] mt-1">
            Data insights for AY {activeAcademicYear} across campuses, calling teams, and marketing drives.
          </p>
        </div>
      </div>

      {/* Report Category Navigation */}
      <div className="bg-white p-1 rounded-xl border border-[#DCE7DF] shadow-xs flex items-center gap-1">
        {[
          { id: 'summary', label: '1. Contact Summary by Campus' },
          { id: 'performance', label: '2. Telecaller Leaderboard' },
          { id: 'funnel', label: '3. Admission Funnel Progress' },
          { id: 'campaigns', label: '4. Campaign Outreach ROI' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeReportTab === tab.id
                ? 'bg-[#39854A] text-white font-bold shadow-xs'
                : 'text-[#172B20] hover:bg-[#F7FAF8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* REPORT 1: Summary by Campus */}
      {activeReportTab === 'summary' && (
        <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-[#DCE7DF] flex items-center justify-between bg-[#F7FAF8]">
            <span className="text-xs font-bold text-[#172B20]">Campus Inbound Distribution</span>
            <span className="text-[11px] text-[#36473C]">Total: {filteredStudents.length} Enquiries</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DCE7DF] text-[#36473C] font-semibold bg-[#F7FAF8]/50">
                <th className="py-3 px-4">College / Faculty</th>
                <th className="py-3 px-3 text-right">Total Leads</th>
                <th className="py-3 px-3 text-right">Highly Interested</th>
                <th className="py-3 px-3 text-right">Admitted</th>
                <th className="py-3 px-3">Enquiry Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE7DF]/60">
              {institutionSummary.map((item) => {
                const share = Math.round((item.total / (filteredStudents.length || 1)) * 100);
                return (
                  <tr key={item.code} className="hover:bg-[#F7FAF8] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#172B20]">{item.name}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-[#172B20]">
                      {item.total}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-[#39854A]">
                      {item.interested}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-800">
                      {item.admitted}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#39854A] h-full rounded-full"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-[#36473C]">{share}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT 2: Telecaller Performance */}
      {activeReportTab === 'performance' && (
        <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-[#DCE7DF] flex items-center justify-between bg-[#F7FAF8]">
            <span className="text-xs font-bold text-[#172B20]">Telecaller Output & Conversions</span>
            <span className="text-[11px] text-[#36473C]">Monitored against daily call targets</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DCE7DF] text-[#36473C] font-semibold bg-[#F7FAF8]/50">
                <th className="py-3 px-4">Telecaller</th>
                <th className="py-3 px-3 text-right">Assigned Leads</th>
                <th className="py-3 px-3 text-right">Calls Today</th>
                <th className="py-3 px-3 text-right">Applied / Admitted</th>
                <th className="py-3 px-3 text-right">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE7DF]/60">
              {performanceData.map((tc) => (
                <tr key={tc.telecaller} className="hover:bg-[#F7FAF8] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#172B20]">{tc.telecaller}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-[#172B20]">
                    {tc.assignedCount}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-[#39854A]">
                    {tc.callsMade}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-800">
                    {tc.conversions}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-[#39854A]">
                    {tc.conversionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT 3: Admission Funnel Progress */}
      {activeReportTab === 'funnel' && (
        <div className="bg-white p-6 rounded-xl border border-[#DCE7DF] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#DCE7DF] pb-3">
            <span className="text-xs font-bold text-[#172B20]">Admission Stage Progression Funnel</span>
            <span className="text-[11px] text-[#36473C]">
              New → Contacted → Interested → Counselling → Applied → Admitted
            </span>
          </div>

          <div className="space-y-4">
            {funnelMetrics.map((f, i) => (
              <div key={f.stage} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#172B20]">
                  <span>
                    Stage {i + 1}: {f.stage}
                  </span>
                  <span className="font-mono tabular-nums">
                    {f.count} candidates ({f.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-[#F7FAF8] border border-[#DCE7DF] h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#39854A] h-full rounded-full transition-all"
                    style={{ width: `${Math.max(f.percentage, 5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPORT 4: WhatsApp Campaigns */}
      {activeReportTab === 'campaigns' && (
        <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-[#DCE7DF] flex items-center justify-between bg-[#F7FAF8]">
            <span className="text-xs font-bold text-[#172B20]">WhatsApp Campaign Delivery Analytics</span>
            <span className="text-[11px] text-[#36473C]">Delivered vs Read vs Replied</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DCE7DF] text-[#36473C] font-semibold bg-[#F7FAF8]/50">
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3 text-right">Sent</th>
                <th className="py-3 px-3 text-right">Delivered</th>
                <th className="py-3 px-3 text-right">Read</th>
                <th className="py-3 px-3 text-right">Replied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE7DF]/60">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-[#F7FAF8] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#172B20]">{camp.name}</td>
                  <td className="py-3.5 px-3 font-semibold text-[#36473C]">{camp.location}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-[#172B20]">
                    {camp.metrics.sent}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700">
                    {camp.metrics.delivered}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-blue-700">
                    {camp.metrics.read}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-purple-700">
                    {camp.metrics.replied}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
