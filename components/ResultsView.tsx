import React from 'react';
import { Candidate, Winner } from '../types';
import { groupCandidatesByDept } from '../utils/parser';
import { Trophy, Award, Zap, Crown, Download, FileText } from 'lucide-react';

interface ResultsViewProps {
  candidates: Candidate[];
  onBack: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ candidates, onBack }) => {
  const groups = groupCandidatesByDept(candidates);
  
  const winners: Winner[] = Object.keys(groups).map(dept => {
    const deptCandidates = groups[dept];
    const maxVotes = Math.max(...deptCandidates.map(c => c.votes));
    const winningCandidates = maxVotes > 0 ? deptCandidates.filter(c => c.votes === maxVotes) : [];
    return {
      department: dept,
      candidates: winningCandidates,
      maxVotes
    };
  });

  const totalVotes = candidates.reduce((acc, c) => acc + c.votes, 0);

  const downloadResults = () => {
    const data = {
      title: "Election Results",
      exportDate: new Date().toLocaleString(),
      summary: {
        totalVotes,
        totalDepartments: Object.keys(groups).length,
      },
      winners: winners.map(w => ({
        department: w.department,
        maxVotes: w.maxVotes,
        candidates: w.candidates.map(c => ({ name: c.name, className: c.className, votes: c.votes }))
      })),
      allCandidates: candidates
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `election_results_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadTxtResults = () => {
    let content = `选举结果公示 (Election Results 2025)\n`;
    content += `导出时间: ${new Date().toLocaleString()}\n`;
    content += `========================================\n\n`;

    winners.forEach(winner => {
      content += `【${winner.department}】\n`;
      if (winner.candidates.length > 0) {
        winner.candidates.forEach(c => {
          content += `  ★ 胜出: ${c.name} (${c.className}) - ${c.votes}票\n`;
        });
      } else {
        content += `  (暂无胜出者)\n`;
      }
      content += `\n`;
    });

    content += `========================================\n`;
    content += `总投票数: ${totalVotes}\n`;
    content += `统计部门: ${Object.keys(groups).length}个\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `election_results_simple_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Title Section */}
      <div className="text-center py-8">
         <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-3xl shadow-lg shadow-amber-200 mb-6 text-white transform rotate-3">
            <Trophy size={40} fill="currentColor" className="drop-shadow-sm" />
         </div>
         <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-2">
           选举结果公示
         </h2>
         <p className="text-slate-400 font-bold tracking-widest uppercase">Election Results 2025</p>
         
         <div className="flex items-center justify-center gap-4 mt-8">
           <button 
             onClick={downloadResults}
             className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold shadow-sm border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all hover:-translate-y-0.5 active:translate-y-0"
           >
             <Download size={18} className="text-slate-500" />
             保存结果 (JSON)
           </button>

           <button 
             onClick={downloadTxtResults}
             className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-300 hover:bg-slate-800 hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
           >
             <FileText size={18} className="text-slate-400" />
             导出名单 (TXT)
           </button>
         </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-violet-600 rounded-full blur-[120px] opacity-30"></div>
        <div className="relative z-10 flex items-center gap-6">
           <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
              <Zap size={32} className="text-yellow-400 fill-yellow-400" />
           </div>
           <div>
              <h4 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-1">Total Votes Cast</h4>
              <p className="text-5xl md:text-6xl font-black tracking-tight text-white">
                 {totalVotes.toLocaleString()} <span className="text-2xl text-slate-500 font-semibold align-top ml-1">票</span>
              </p>
           </div>
        </div>
        <div className="relative z-10 hidden md:block h-16 w-px bg-white/10"></div>
        <div className="relative z-10 text-right md:text-left">
           <p className="text-slate-400 font-medium mb-1">统计部门</p>
           <p className="text-3xl font-bold text-white">{Object.keys(groups).length} <span className="text-lg text-slate-500 font-normal">个</span></p>
        </div>
      </div>

      {/* Winners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {winners.map((winner, idx) => (
          <div key={winner.department} className="group bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative hover:-translate-y-2 transition-transform duration-300">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Award size={140} />
            </div>
            
            <div className="p-8 relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div className="bg-slate-100 px-4 py-2 rounded-xl">
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    {winner.department}
                  </h3>
                </div>
                {winner.candidates.length > 1 && (
                  <span className="text-xs font-bold bg-orange-100 text-orange-600 px-3 py-1.5 rounded-lg border border-orange-200">
                     平票
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                {winner.candidates.length > 0 ? (
                  <div className="space-y-6">
                    {winner.candidates.map((candidate, cIdx) => (
                      <div key={candidate.id} className="flex items-center gap-5">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-3xl shadow-lg shadow-slate-300/50 group-hover:scale-105 transition-transform duration-300">
                            {candidate.name.charAt(0)}
                          </div>
                          <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 rounded-full p-2 border-4 border-white shadow-sm">
                             <Crown size={14} fill="currentColor" />
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-3xl font-black text-slate-900 leading-none tracking-tight">{candidate.name}</p>
                          <p className="text-base font-semibold text-slate-400 mt-2">{candidate.className}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                    <p className="text-slate-400 font-medium">暂无胜出者</p>
                  </div>
                )}
              </div>

              <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Winning Score</div>
                 <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 tracking-tighter">
                    {winner.maxVotes}
                 </div>
              </div>
            </div>
            
            {/* Bottom Color Bar */}
            <div className="h-3 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 opacity-80"></div>
          </div>
        ))}
      </div>
    </div>
  );
};