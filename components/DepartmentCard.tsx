import React from 'react';
import { Candidate } from '../types';
import { Plus, Minus, Crown } from 'lucide-react';

interface DepartmentCardProps {
  departmentName: string;
  candidates: Candidate[];
  onVote: (id: string, delta: number) => void;
  isResultMode?: boolean;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({ 
  departmentName, 
  candidates, 
  onVote,
  isResultMode = false
}) => {
  // Sort logic
  const sortedCandidates = [...candidates].sort((a, b) => {
    return b.votes - a.votes;
  });

  const maxVotes = Math.max(...candidates.map(c => c.votes), 0);
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  return (
    <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col h-full overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] duration-300">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-end bg-gradient-to-r from-white to-slate-50/50">
        <div>
           <h3 className="font-black text-slate-800 text-xl tracking-tight">{departmentName}</h3>
           <div className="text-slate-400 text-xs font-semibold mt-1 uppercase tracking-wider">Department</div>
        </div>
        <div className="flex items-center gap-2">
           <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
             {candidates.length} 人
           </div>
           <div className="text-xs font-bold text-violet-500 bg-violet-50 px-2 py-1 rounded-md">
             {totalVotes} 票
           </div>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto max-h-[500px] space-y-3 no-scrollbar bg-white">
        {sortedCandidates.map((candidate, index) => {
          const isLeader = candidate.votes > 0 && candidate.votes === maxVotes;
          const percentage = maxVotes > 0 ? (candidate.votes / maxVotes) * 100 : 0;
          
          return (
            <div 
              key={candidate.id} 
              className={`group relative flex items-center justify-between p-1 rounded-2xl border transition-all duration-300 ${
                isLeader && candidate.votes > 0 
                  ? 'border-violet-200 bg-violet-50/30' 
                  : 'border-slate-100 bg-white hover:border-slate-300'
              }`}
            >
              {/* Modern Progress Bar Background */}
              <div 
                className={`absolute left-0 top-0 bottom-0 rounded-l-2xl transition-all duration-500 ease-out opacity-20 ${
                    isLeader ? 'bg-violet-400' : 'bg-slate-200'
                }`}
                style={{ width: `${percentage}%`, minWidth: percentage > 0 ? '6px' : '0' }}
              />

              <div className="relative z-10 flex items-center gap-4 pl-4 py-2 flex-1">
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-inner
                    ${isLeader ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-500'}
                `}>
                   {index + 1}
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg leading-tight ${isLeader ? 'text-violet-900' : 'text-slate-700'}`}>
                        {candidate.name}
                    </span>
                    {isLeader && <Crown size={14} className="text-amber-400 fill-amber-400 animate-bounce-slow" />}
                  </div>
                  <span className="text-xs font-medium text-slate-400">{candidate.className}</span>
                </div>
              </div>

              <div className="relative z-10 flex items-center pr-2">
                {!isResultMode && (
                   <button
                      onClick={() => onVote(candidate.id, -1)}
                      disabled={candidate.votes === 0}
                      className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-200 text-slate-300 hover:text-slate-600 disabled:opacity-0 transition-all mr-2"
                    >
                      <Minus size={14} strokeWidth={3} />
                    </button>
                )}

                <div className={`text-2xl font-black font-mono w-12 text-center tabular-nums tracking-tighter ${isLeader && candidate.votes > 0 ? 'text-violet-600' : 'text-slate-300'}`}>
                  {candidate.votes}
                </div>
                
                {!isResultMode && (
                    <button
                      onClick={() => onVote(candidate.id, 1)}
                      className="ml-2 w-12 h-12 rounded-xl bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-200 hover:shadow-xl active:scale-90 active:bg-violet-600 transition-all flex items-center justify-center"
                    >
                      <Plus size={20} strokeWidth={3} />
                    </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};