import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Show({ transfer, file_info, is_ticket }) {
    const { auth } = usePage().props;
    const isSender = auth.user.id === transfer.sender_id;
    const isReceiver = auth.user.id === transfer.receiver_id;

    return (
        <AuthenticatedLayout
            header="Transaction Intelligence"
        >
            <Head title="Transfer Details" />

            <div className="mx-auto max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="card shadow-2xl border border-gray-100">
                            <div className="flex justify-between items-start mb-10 pb-6 border-b border-gray-50">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                            is_ticket ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'
                                        }`}>
                                            {is_ticket ? 'Inbound Request' : 'Outbound Transfer'}
                                        </span>
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                            transfer.status === 'approved' ? 'bg-green-600 text-white' :
                                            transfer.status === 'rejected' ? 'bg-red-600 text-white' :
                                            'bg-yellow-400 text-white'
                                        }`}>
                                            {transfer.status}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
                                        {is_ticket ? 'Secure File Retrieval' : 'Encrypted Data Dispatch'}
                                    </h3>
                                </div>

                                {(isSender) && (
                                    <div className="text-right flex gap-6 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                                        <div>
                                            <div className="text-xl font-black text-indigo-600 leading-none">{transfer.view_count || 0}</div>
                                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-1">Interactions</div>
                                        </div>
                                        <div className="w-px bg-gray-200" />
                                        <div>
                                            <div className="text-xl font-black text-indigo-600 leading-none">{transfer.download_count || 0}</div>
                                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-1">Downloads</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="group p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 transition">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Originating Party</label>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">{transfer.sender.name.charAt(0)}</div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-800">{transfer.sender.name}</div>
                                                <div className="text-[10px] text-gray-400 font-medium">{transfer.sender.email}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 transition">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Target Recipient</label>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-xs">{transfer.receiver.name.charAt(0)}</div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-800">{transfer.receiver.name}</div>
                                                <div className="text-[10px] text-gray-400 font-medium">{transfer.receiver.email}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Resource Manifest</label>
                                        {file_info ? (
                                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4 group">
                                                <div className="text-indigo-600 group-hover:scale-110 transition">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <div className="text-sm font-bold text-indigo-900 truncate">{file_info.original_name}</div>
                                                    <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">
                                                        {(file_info.size / 1024).toFixed(1)} KB • {file_info.mime_type.split('/')[1].toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-xs font-bold italic">
                                                No payload attached or cleared.
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Contextual Message</label>
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-600 leading-relaxed italic">
                                            "{transfer.message || 'No contextual information provided for this transaction.'}"
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-50 flex justify-between items-center">
                                <Link
                                    href={auth.user.role === 'admin' ? route('admin.transfers') : route('inbox.index')}
                                    className="text-[10px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition"
                                >
                                    ← Return to Workflow
                                </Link>

                                {transfer.download_url && (
                                    <a
                                        href={transfer.download_url}
                                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95"
                                    >
                                        Secure Download
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Approval Timeline */}
                    <div className="space-y-6">
                        <div className="card shadow-xl border border-gray-50">
                            <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">
                                Approval Lifecycle
                            </h4>
                            
                            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-600 before:via-gray-100 before:to-transparent">
                                {/* Initial Submission */}
                                <div className="relative flex items-center justify-between gap-4 group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-8 rounded-full bg-indigo-600 border-4 border-white shadow-sm z-10 shrink-0" />
                                        <div>
                                            <div className="text-xs font-bold text-gray-800">Workflow Initiated</div>
                                            <div className="text-[10px] text-gray-400 font-medium">By {transfer.sender.name}</div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-gray-300 font-bold uppercase">{new Date(transfer.created_at).toLocaleDateString()}</div>
                                </div>

                                {/* Multi-stage Approvals */}
                                {transfer.approval_logs?.map((log, index) => (
                                    <div key={log.id} className="relative flex items-center justify-between gap-4 group">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-8 w-8 rounded-full border-4 border-white shadow-sm z-10 shrink-0 flex items-center justify-center text-[10px] text-white font-bold ${
                                                log.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                                            }`}>
                                                {log.status === 'approved' ? '✓' : '✗'}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-800">
                                                    Stage {log.step}: {log.status.toUpperCase()}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-medium">By {log.user.name}</div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-gray-300 font-bold uppercase">
                                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}

                                {/* Current Pending Stage */}
                                {transfer.status === 'pending' && transfer.approver && (
                                    <div className="relative flex items-center justify-between gap-4 group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-8 w-8 rounded-full bg-yellow-400 border-4 border-white shadow-sm z-10 shrink-0 animate-pulse" />
                                            <div>
                                                <div className="text-xs font-bold text-gray-800 italic">Awaiting Stage {transfer.current_step}</div>
                                                <div className="text-[10px] text-indigo-600 font-black uppercase tracking-tighter">Current: {transfer.approver.name}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Final Resolution */}
                                {transfer.status !== 'pending' && (
                                    <div className="relative flex items-center justify-between gap-4 group">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-8 w-8 rounded-full border-4 border-white shadow-sm z-10 shrink-0 ${
                                                transfer.status === 'approved' ? 'bg-green-600' : 'bg-red-600'
                                            }`} />
                                            <div>
                                                <div className="text-xs font-bold text-gray-800">Transaction {transfer.status === 'approved' ? 'Resolved' : 'Terminated'}</div>
                                                <div className="text-[10px] text-gray-400 font-medium">Flow Finalized</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl text-white shadow-2xl shadow-indigo-200">
                            <h5 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60">System Security Note</h5>
                            <p className="text-xs leading-relaxed font-medium opacity-90">
                                This transaction is protected by end-to-end encryption. Each approval stage is cryptographically logged for forensic auditing.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
