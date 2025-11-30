import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    CornerDownLeft,
    FileText,
    Keyboard,
    RotateCcw,
    Search,
    Upload,
    Vote
} from 'lucide-react';
// @ts-ignore
import Pinyin from 'tiny-pinyin';
import {AppState, Candidate} from './types';
import {groupCandidatesByDept, parseCandidateList} from './utils/parser';
import {DepartmentCard} from './components/DepartmentCard';
import {ResultsView} from './components/ResultsView';
import logo from './assets/zslhzxLOGO.png';

const DEMO_DATA = `学习部 - 张三 (高二1班)
学习部 - 李四 (高二3班)
文体部 - 王五 (高一2班)
文体部 - 赵六 (高一5班)
宣传部 - 钱七 (高二2班)`;

const Footer = ({className = ""}: { className?: string }) => (
    <footer className={`py-6 text-center text-slate-400 text-xs font-medium tracking-wide select-none ${className}`}>
        Powered By LaoShui @ 2025 | 舟山市六横中学
    </footer>
);

const App: React.FC = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [appState, setAppState] = useState<AppState>('setup');
    const [inputText, setInputText] = useState<string>('');
    const [showResetModal, setShowResetModal] = useState(false);
    const [showFinishModal, setShowFinishModal] = useState(false);

    // Quick Vote State
    const [quickVoteInput, setQuickVoteInput] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0); // Track keyboard selection
    const [lastVotedCandidate, setLastVotedCandidate] = useState<string | null>(null);
    const quickVoteInputRef = useRef<HTMLInputElement>(null);
    const suggestionsListRef = useRef<HTMLDivElement>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus quick vote input when switching to voting mode
    useEffect(() => {
        if (appState === 'voting') {
            setTimeout(() => quickVoteInputRef.current?.focus(), 100);
        }
    }, [appState]);

    // Reset selected index when input changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [quickVoteInput]);

    // Scroll selected item into view
    useEffect(() => {
        if (suggestionsListRef.current && matchedCandidates.length > 0) {
            const activeItem = suggestionsListRef.current.children[selectedIndex] as HTMLElement;
            if (activeItem) {
                // Simple scroll into view logic
                const container = suggestionsListRef.current;
                if (activeItem.offsetTop < container.scrollTop) {
                    container.scrollTop = activeItem.offsetTop;
                } else if (activeItem.offsetTop + activeItem.offsetHeight > container.scrollTop + container.offsetHeight) {
                    container.scrollTop = activeItem.offsetTop + activeItem.offsetHeight - container.offsetHeight;
                }
            }
        }
    }, [selectedIndex]);

    // Pinyin/Search Logic
    const matchedCandidates = useMemo(() => {
        if (!quickVoteInput.trim()) return [];

        const term = quickVoteInput.toLowerCase();

        return candidates.filter(c => {
            const name = c.name.toLowerCase();
            // 1. Match Exact Name
            if (name.includes(term)) return true;

            // 2. Match Pinyin Initials (e.g., 'zs' matches 'Zhang San')
            if (Pinyin.isSupported()) {
                // Convert '张三' -> 'ZHANG-SAN' (separator is important)
                const pinyinFull = Pinyin.convertToPinyin(c.name, '-', true).toLowerCase(); // 'zhang-san'

                // Check full pinyin match (e.g. 'zhang')
                if (pinyinFull.replace(/-/g, '').includes(term)) return true;

                // Check Initials (e.g. 'zs')
                const initials = pinyinFull.split('-').map((p: string) => p[0]).join('');
                if (initials.includes(term)) return true;
            }
            return false;
        });
    }, [quickVoteInput, candidates]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setInputText(text);
            };
            reader.readAsText(file);
        }
    };

    const startVoting = () => {
        const parsed = parseCandidateList(inputText);
        if (parsed.length === 0) {
            alert("无法解析名单，请检查格式。");
            return;
        }
        setCandidates(parsed);
        setAppState('voting');
    };

    const handleVote = (id: string, delta: number) => {
        setCandidates(prev => prev.map(c =>
            c.id === id ? {...c, votes: Math.max(0, c.votes + delta)} : c
        ));
    };

    const handleQuickVoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (matchedCandidates.length > 0) {
            const target = matchedCandidates[selectedIndex];
            if (target) {
                handleVote(target.id, 1);
                setLastVotedCandidate(target.name);
                setQuickVoteInput('');
                setSelectedIndex(0);

                // Clear feedback after 2s
                setTimeout(() => setLastVotedCandidate(null), 2000);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (matchedCandidates.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % matchedCandidates.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + matchedCandidates.length) % matchedCandidates.length);
        }
    };

    const confirmFinish = () => {
        setAppState('results');
        setShowFinishModal(false);
    };

    const confirmReset = () => {
        setAppState('setup');
        setCandidates([]);
        setInputText('');
        setQuickVoteInput('');
        setShowResetModal(false);
    };

    // Setup View - Modernized
    if (appState === 'setup') {
        return (
            <div className="min-h-screen flex flex-col bg-[#f2f2f2] relative overflow-hidden">
                {/* Background decorative elements */}
                <div
                    className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>

                <div className="flex-1 flex items-center justify-center w-full z-10 p-6">
                    <div
                        className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] shadow-2xl w-full max-w-4xl border border-white/50 relative grid grid-cols-1 md:grid-cols-2 gap-12">

                        <div className="flex flex-col justify-center">
                            <div
                                className="inline-flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold w-fit mb-6">
                                <Vote size={14} className="text-lime-400"/>
                                ELECTION SYSTEM 2025
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight mb-6">
                                学生会<br/>
                                <span
                                    className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">部长竞选</span>
                                <br/>计票系统
                            </h1>
                            <p className="text-slate-500 text-lg leading-relaxed mb-8">
                                极简、高效的现代化计票工具。支持批量导入名单，实时大屏展示投票进度，自动生成获胜结果。
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="group flex items-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 hover:border-violet-500 rounded-2xl text-slate-700 font-bold transition-all hover:shadow-lg hover:-translate-y-1"
                                >
                                    <div
                                        className="bg-slate-100 p-2 rounded-lg group-hover:bg-violet-100 transition-colors">
                                        <Upload size={20} className="text-slate-600 group-hover:text-violet-600"/>
                                    </div>
                                    <span>导入 TXT</span>
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" accept=".txt"
                                       onChange={handleFileUpload}/>

                                <button
                                    onClick={() => setInputText(DEMO_DATA)}
                                    className="group flex items-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 hover:border-pink-500 rounded-2xl text-slate-700 font-bold transition-all hover:shadow-lg hover:-translate-y-1"
                                >
                                    <div
                                        className="bg-slate-100 p-2 rounded-lg group-hover:bg-pink-100 transition-colors">
                                        <FileText size={20} className="text-slate-600 group-hover:text-pink-600"/>
                                    </div>
                                    <span>使用示例</span>
                                </button>
                            </div>
                        </div>

                        <div
                            className="flex flex-col h-full bg-slate-50 rounded-3xl p-2 border border-slate-100 shadow-inner">
                            <div className="flex-1 relative">
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`粘贴名单或使用按钮导入...\n\n格式示例：\n${DEMO_DATA}`}
                    className="w-full h-full p-6 bg-transparent border-none focus:ring-0 resize-none font-mono text-sm text-slate-600 placeholder:text-slate-300 leading-relaxed"
                />
                            </div>
                            <button
                                onClick={startVoting}
                                disabled={!inputText.trim()}
                                className="w-full py-4 bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                            >
                                开始投票
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                            </button>
                        </div>

                    </div>
                </div>

                <Footer className="relative z-10"/>
            </div>
        );
    }

    // Shared Header for Voting and Results
    const Header = () => (
        <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
            <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img src={logo} alt="Logo" className="h-12 w-auto"/>
                </div>

                {appState === 'voting' && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowResetModal(true)}
                            className="hidden md:flex px-4 py-2.5 text-slate-400 font-semibold hover:bg-slate-800 hover:text-red-400 rounded-xl transition-colors items-center gap-2"
                        >
                            <RotateCcw size={16}/>
                            重置
                        </button>
                        <button
                            onClick={() => setShowFinishModal(true)}
                            className="px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold shadow-lg shadow-slate-900/50 hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
                        >
                            <CheckCircle2 size={18} className="text-violet-600"/>
                            完成统计
                        </button>
                    </div>
                )}

                {appState === 'results' && (
                    <button onClick={() => setAppState('voting')}
                            className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                        ← 返回计票
                    </button>
                )}
            </div>
        </header>
    );

    // Voting View
    if (appState === 'voting') {
        const grouped = groupCandidatesByDept(candidates);

        return (
            <div className="min-h-screen bg-[#f8f9fc] flex flex-col font-sans relative">
                <Header/>

                <main className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col">
                    <div
                        className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full mb-auto">
                        {Object.keys(grouped).map(dept => (
                            <DepartmentCard
                                key={dept}
                                departmentName={dept}
                                candidates={grouped[dept]}
                                onVote={handleVote}
                            />
                        ))}
                    </div>
                    <Footer className="mt-12 pb-6"/>
                </main>

                {/* Quick Vote Bar */}
                <div className="fixed bottom-32 left-0 right-0 z-30 px-4 flex justify-center">
                    <div className="w-full max-w-2xl relative">
                        {/* Suggestions Popup */}
                        {quickVoteInput && matchedCandidates.length > 0 && (
                            <div
                                className="absolute bottom-full left-0 right-0 mb-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
                                <div
                                    className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        匹配到 {matchedCandidates.length} 位候选人
                                    </div>
                                    <div
                                        className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-white px-2 py-1 rounded border">
                                        <span className="bg-slate-100 px-1 rounded">↑</span>
                                        <span className="bg-slate-100 px-1 rounded">↓</span>
                                        <span>选择</span>
                                        <span className="bg-slate-100 px-1 rounded ml-1">↵</span>
                                        <span>确认</span>
                                    </div>
                                </div>

                                <div ref={suggestionsListRef}
                                     className="max-h-[240px] overflow-y-auto custom-scrollbar">
                                    {matchedCandidates.map((c, idx) => (
                                        <div
                                            key={c.id}
                                            onClick={() => {
                                                setSelectedIndex(idx);
                                                quickVoteInputRef.current?.focus();
                                            }}
                                            className={`flex items-center justify-between p-3 px-4 transition-colors cursor-pointer ${
                                                idx === selectedIndex
                                                    ? 'bg-violet-50 border-l-4 border-violet-500'
                                                    : 'hover:bg-slate-50 border-l-4 border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                                        idx === selectedIndex ? 'bg-violet-200 text-violet-700' : 'bg-slate-200 text-slate-600'
                                                    }`}>
                                                    {c.department.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${idx === selectedIndex ? 'text-violet-900' : 'text-slate-900'}`}>
                                                        {c.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{c.className} · {c.department}</p>
                                                </div>
                                            </div>
                                            {idx === selectedIndex && (
                                                <CornerDownLeft size={16} className="text-violet-400"/>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Feedback Toast */}
                        {lastVotedCandidate && (
                            <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-50">
                                <div
                                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-short whitespace-nowrap">
                                    <CheckCircle2 className="text-lime-400" size={20}/>
                                    <span className="font-bold">已为 {lastVotedCandidate} +1 票</span>
                                </div>
                            </div>
                        )}

                        {/* Input Bar */}
                        <form
                            onSubmit={handleQuickVoteSubmit}
                            className={`relative flex items-center bg-white/90 backdrop-blur-xl border-2 transition-colors rounded-2xl shadow-2xl shadow-slate-300/50 p-2 ${
                                quickVoteInput && matchedCandidates.length > 0 ? 'border-violet-500 ring-4 ring-violet-500/20' : 'border-white/50'
                            }`}
                        >
                            <div className="pl-4 pr-3 text-slate-400">
                                {quickVoteInput ? <Keyboard size={24} className="text-violet-500"/> :
                                    <Search size={24}/>}
                            </div>
                            <input
                                ref={quickVoteInputRef}
                                type="text"
                                value={quickVoteInput}
                                onChange={(e) => setQuickVoteInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="输入姓名首字母快速投票..."
                                className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium h-12"
                                autoComplete="off"
                            />
                            <div className="pr-2">
                                <button
                                    type="submit"
                                    disabled={matchedCandidates.length === 0}
                                    className="bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white h-10 px-4 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                                >
                                    <span>投票</span>
                                    <div className="bg-white/20 px-1.5 rounded text-[10px] hidden sm:block">↵</div>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Custom Modals */}
                {showFinishModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                             onClick={() => setShowFinishModal(false)}/>
                        <div
                            className="bg-white rounded-3xl p-8 w-full max-w-sm relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div
                                className="w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center mb-4 text-lime-600">
                                <CheckCircle2 size={24}/>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">确认完成统计?</h3>
                            <p className="text-slate-500 mb-6">系统将停止计票并生成最终的胜选结果报表。</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowFinishModal(false)}
                                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={confirmFinish}
                                    className="flex-1 py-3 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-colors"
                                >
                                    确认完成
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showResetModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                             onClick={() => setShowResetModal(false)}/>
                        <div
                            className="bg-white rounded-3xl p-8 w-full max-w-sm relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div
                                className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                                <AlertCircle size={24}/>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">重置所有数据?</h3>
                            <p className="text-slate-500 mb-6">此操作将清空当前所有票数和名单，无法撤销。</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowResetModal(false)}
                                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={confirmReset}
                                    className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
                                >
                                    确认重置
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        );
    }

    // Results View
    if (appState === 'results') {
        return (
            <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
                <Header/>
                <div className="flex-1 flex flex-col">
                    <ResultsView candidates={candidates} onBack={() => setAppState('voting')}/>
                </div>
                <Footer/>
            </div>
        );
    }

    return null;
};

export default App;