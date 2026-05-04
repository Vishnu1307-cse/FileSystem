import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path} />
    </svg>
);

export default function Compose({ categories }) {
    const { auth } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        receiver_type: 'employee',
        receiver_id: '',
        receiver_email: '',
        category_id: '',
        subject: '',
        body: '',
        cc_ids: [],
        message: '',
        file: null,
        is_ticket: false
    });

    const [receivers, setReceivers] = useState([]);
    const [isSearchingReceivers, setIsSearchingReceivers] = useState(false);
    const [showReceiverResults, setShowReceiverResults] = useState(false);
    
    const [ccSearch, setCcSearch] = useState('');
    const [ccResults, setCcResults] = useState([]);
    const [isSearchingCcs, setIsSearchingCcs] = useState(false);
    const [selectedCcs, setSelectedCcs] = useState([]);

    const handleReceiverSearch = async (query) => {
        setData('receiver_email', query);
        setData('receiver_id', ''); // Reset ID when typing
        
        if (query.length < 2) {
            setReceivers([]);
            setShowReceiverResults(false);
            return;
        }

        setIsSearchingReceivers(true);
        setShowReceiverResults(true);
        try {
            const response = await axios.get(route('api.users.receivers'), {
                params: { type: data.receiver_type, q: query }
            });
            setReceivers(response.data);
        } catch (error) {
            console.error('Error fetching receivers:', error);
        } finally {
            setIsSearchingReceivers(false);
        }
    };

    const handleCcSearch = async (query) => {
        setCcSearch(query);
        if (query.length < 2) {
            setCcResults([]);
            setIsSearchingCcs(false);
            return;
        }

        setIsSearchingCcs(true);
        try {
            const response = await axios.get(route('api.users.receivers'), {
                params: { type: 'employee', q: query }
            });
            setCcResults(response.data.filter(u => u.id !== auth.user.id && !selectedCcs.find(s => s.id === u.id)));
        } catch (error) {
            console.error('Error fetching CCs:', error);
        } finally {
            setIsSearchingCcs(false);
        }
    };

    const selectReceiver = (user) => {
        setData(prev => ({
            ...prev,
            receiver_id: user.id,
            receiver_email: user.email
        }));
        setReceivers([]);
        setShowReceiverResults(false);
    };

    const addCc = (user) => {
        const newCcs = [...selectedCcs, user];
        setSelectedCcs(newCcs);
        setData('cc_ids', newCcs.map(u => u.id));
        setCcSearch('');
        setCcResults([]);
    };

    const removeCc = (userId) => {
        const newCcs = selectedCcs.filter(u => u.id !== userId);
        setSelectedCcs(newCcs);
        setData('cc_ids', newCcs.map(u => u.id));
    };

    const [approvers, setApprovers] = useState([{ name: '', email: '' }]);

    const handleApproverChange = (index, field, value) => {
        const updated = [...approvers];
        updated[index][field] = value;
        setApprovers(updated);
    };

    const addApprover = () => setApprovers([...approvers, { name: '', email: '' }]);
    const removeApprover = (index) => setApprovers(approvers.filter((_, i) => i !== index));

    const submit = (e) => {
        e.preventDefault();
        
        if (!data.is_ticket) {
            // New Mail workflow with dynamic approvers
            const payload = new FormData();
            payload.append('receiver', data.receiver_email);
            if (selectedCcs.length > 0) payload.append('cc', selectedCcs.map(u => u.email).join(', '));
            payload.append('subject', data.subject);
            payload.append('body', data.body);
            if (data.file) payload.append('attachments[]', data.file);
            
            payload.append('category_id', data.category_id);

            window.axios.post('/api/mails', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then(() => {
                reset();
                setSelectedCcs([]);
                setApprovers([{ name: '', email: '' }]);
            }).catch(err => {
                // handle errors
            });
        } else {
            // Traditional Transfer/Ticket workflow
            post(route('transfers.store'), {
                onSuccess: () => {
                    reset();
                    setSelectedCcs([]);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            header="Compose Secure Mail Transmission"
        >
            <Head title="Compose Transfer" />

            <div className="mx-auto max-w-5xl pb-20">
                <div className="card shadow-2xl border border-gray-100 p-6 md:p-8">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Header Actions */}
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setData('is_ticket', false);
                                    setReceivers([]);
                                    setShowReceiverResults(false);
                                }}
                                className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${
                                    !data.is_ticket 
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-100' 
                                    : 'border-gray-50 bg-gray-50 text-gray-400 opacity-60 hover:opacity-100'
                                }`}
                            >
                                <Icon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="w-6 h-6" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Send Secure Mail (External)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setData('is_ticket', true);
                                    setReceivers([]);
                                    setShowReceiverResults(false);
                                }}
                                className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${
                                    data.is_ticket 
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-100' 
                                    : 'border-gray-50 bg-gray-50 text-gray-400 opacity-60 hover:opacity-100'
                                }`}
                            >
                                <Icon path="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" className="w-6 h-6 rotate-180" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Internal File Transfer</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Panel */}
                            <div className="lg:col-span-7 space-y-5">
                                <div>
                                    <InputLabel value="Sender Identity" />
                                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4 mt-1">
                                        <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">{auth.user.name.charAt(0)}</div>
                                        <div className="overflow-hidden">
                                            <div className="text-sm font-black text-gray-800 leading-none">{auth.user.name}</div>
                                            <div className="text-[10px] text-gray-500 font-medium mt-1 truncate">{auth.user.email}</div>
                                            <div className="text-[9px] text-indigo-500 font-bold uppercase tracking-tighter mt-0.5">UID: {auth.user.id}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        {['employee', 'vendor', 'customer'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => {
                                                    setData('receiver_type', type);
                                                    setReceivers([]);
                                                    setShowReceiverResults(false);
                                                }}
                                                className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase transition-all tracking-widest border-2 ${
                                                    data.receiver_type === type 
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                                    : 'bg-white text-gray-400 border-gray-50 hover:border-gray-200'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative">
                                        <InputLabel value="Target Recipient" />
                                        <div className="relative">
                                            <TextInput
                                                className="mt-1 block w-full rounded-xl border-gray-100 bg-gray-50/50 py-2.5 pr-10"
                                                value={data.receiver_email}
                                                onChange={(e) => handleReceiverSearch(e.target.value)}
                                                onFocus={() => data.receiver_email.length >= 2 && setShowReceiverResults(true)}
                                                placeholder="Search by name or email..."
                                                required
                                            />
                                            {isSearchingReceivers && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                        {showReceiverResults && (
                                            <ul className="absolute z-30 w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                {receivers.map(u => (
                                                    <li 
                                                        key={u.id}
                                                        onClick={() => selectReceiver(u)}
                                                        className="px-5 py-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 last:border-0 transition flex justify-between items-center"
                                                    >
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-800 leading-tight">{u.email}</div>
                                                            <div className="text-[9px] text-indigo-600 uppercase font-black tracking-widest">{u.name}</div>
                                                        </div>
                                                        <Icon path="M9 5l7 7-7 7" className="w-4 h-4 opacity-30" />
                                                    </li>
                                                ))}
                                                {receivers.length === 0 && !isSearchingReceivers && (
                                                    <li className="px-5 py-4 text-center text-xs text-gray-400 font-bold uppercase tracking-widest italic">
                                                        No results found
                                                    </li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                <div className="relative">
                                    <InputLabel value="Carbon Copy (Employees Only)" />
                                    <div className="relative mt-1">
                                        <div className="p-2 bg-gray-50/50 border border-gray-100 rounded-xl flex flex-wrap gap-2 min-h-[44px] pr-10">
                                            {selectedCcs.map(u => (
                                                <span key={u.id} className="inline-flex items-center gap-1 bg-white border border-indigo-100 px-2.5 py-1 rounded-lg text-[9px] font-black text-indigo-600 shadow-sm animate-in zoom-in-90">
                                                    {u.name} <span className="opacity-50 font-medium">({u.email})</span>
                                                    <button type="button" onClick={() => removeCc(u.id)} className="hover:text-red-500 font-bold ml-1">×</button>
                                                </span>
                                            ))}
                                            <input 
                                                className="flex-1 min-w-[120px] bg-transparent border-0 focus:ring-0 text-xs p-1"
                                                placeholder={selectedCcs.length === 0 ? "Search employees..." : ""}
                                                value={ccSearch}
                                                onChange={(e) => handleCcSearch(e.target.value)}
                                            />
                                        </div>
                                        {isSearchingCcs && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                    {ccSearch.length >= 2 && (
                                        <ul className="absolute z-30 w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                            {ccResults.map(u => (
                                                <li 
                                                    key={u.id}
                                                    onClick={() => addCc(u)}
                                                    className="px-5 py-2.5 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 last:border-0 transition flex items-center justify-between"
                                                >
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-800">{u.name}</div>
                                                        <div className="text-[9px] text-gray-400 font-medium">{u.email}</div>
                                                    </div>
                                                    <span className="text-indigo-600 font-black">+</span>
                                                </li>
                                            ))}
                                            {ccResults.length === 0 && !isSearchingCcs && (
                                                <li className="px-5 py-4 text-center text-xs text-gray-400 font-bold uppercase tracking-widest italic">
                                                    No results found
                                                </li>
                                            )}
                                        </ul>
                                    )}
                                </div>

                                <div>
                                    <InputLabel value="Transmission Subject" />
                                    <TextInput
                                        className="mt-1 block w-full rounded-xl border-gray-100 bg-gray-50/50 py-2.5"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        placeholder="Enter mail subject line..."
                                        required
                                    />
                                    {errors.subject && <div className="text-red-500 text-[10px] mt-1 font-bold">{errors.subject}</div>}
                                </div>

                                <div>
                                    <InputLabel value="Mail Content (Body)" />
                                    <textarea
                                        className="mt-1 block w-full rounded-xl border-gray-100 bg-gray-50/50 text-sm font-medium focus:ring-indigo-600 focus:border-indigo-600 h-32"
                                        value={data.body}
                                        onChange={(e) => setData('body', e.target.value)}
                                        placeholder="Compose your secure message here..."
                                        required
                                    />
                                    {errors.body && <div className="text-red-500 text-[10px] mt-1 font-bold">{errors.body}</div>}
                                </div>
                            </div>

                            {/* Right Panel */}
                            <div className="lg:col-span-5 space-y-6">
                                <div className="animate-in slide-in-from-right-4 duration-300">
                                    <InputLabel value="Approval Workflow" />
                                    <select
                                        className="mt-1 block w-full rounded-xl border-gray-100 bg-gray-50/50 text-[11px] font-black focus:ring-indigo-600 focus:border-indigo-600 py-3 uppercase tracking-widest"
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Predefined Chain</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-widest text-center">
                                        Admin-defined sequential approval stages
                                    </p>
                                </div>

                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <InputLabel value="Secure Payload (Optional)" />
                                    <div className="mt-1 flex justify-center px-4 py-6 border-2 border-gray-100 border-dashed rounded-2xl hover:border-indigo-600 transition bg-indigo-50/20 group cursor-pointer relative overflow-hidden">
                                        <div className="space-y-3 text-center z-10">
                                            <Icon path="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" className="w-10 h-10 mx-auto text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <label className="relative cursor-pointer bg-indigo-600 px-5 py-2 rounded-xl font-black text-white text-[9px] uppercase tracking-widest shadow-lg shadow-indigo-100">
                                                    <span>Pick File</span>
                                                    <input 
                                                        type="file" 
                                                        className="sr-only" 
                                                        onChange={(e) => setData('file', e.target.files[0])}
                                                    />
                                                </label>
                                            </div>
                                            <p className="text-[8px] text-gray-400 font-black uppercase tracking-tighter">AES-256 GCM Encryption</p>
                                        </div>
                                    </div>
                                    {data.file && (
                                        <div className="mt-3 p-3 bg-indigo-600 text-white rounded-xl flex items-center justify-between shadow-xl animate-in slide-in-from-top-2">
                                            <div className="flex items-center gap-2">
                                                <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" className="w-5 h-5 opacity-70" />
                                                <div className="overflow-hidden">
                                                    <div className="text-[10px] font-black truncate max-w-[140px]">{data.file.name}</div>
                                                    <div className="text-[8px] font-bold opacity-60">{(data.file.size / 1024 / 1024).toFixed(2)} MB</div>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => setData('file', null)} className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">&times;</button>
                                        </div>
                                    )}
                                    {errors.file && <div className="text-red-500 text-[10px] mt-1 font-bold">{errors.file}</div>}
                                </div>

                                <div>
                                    <InputLabel value="Private Comments" />
                                    <textarea
                                        className="mt-1 block w-full rounded-xl border-gray-100 bg-gray-50/50 text-xs font-medium focus:ring-indigo-600 focus:border-indigo-600 h-20"
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        placeholder="Internal notes for approvers..."
                                    />
                                </div>

                                <div className="pt-4 flex flex-col gap-3">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`w-full py-4 ${data.is_ticket ? 'bg-indigo-600' : 'bg-emerald-600'} text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition shadow-2xl active:scale-[0.98]`}
                                    >
                                        {processing ? 'Processing...' : 'Initiate Approval Flow'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
