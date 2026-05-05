import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';

export default function Approvals({ approvals }) {
    const { props } = usePage();
    const { post, processing } = useForm();

    const handleApprove = (approval) => {
        if (approval.source_type === 'sent_mail') {
            post(route('mail-approvals.approve', approval.id));
        } else {
            post(route('transfers.approve', approval.id));
        }
    };

    const handleReject = (approval) => {
        if (confirm('Are you sure you want to reject this transfer? The flow will be terminated immediately.')) {
            if (approval.source_type === 'sent_mail') {
                post(route('mail-approvals.reject', approval.id));
            } else {
                post(route('transfers.reject', approval.id));
            }
        }
    };

    return (
        <AuthenticatedLayout
            header="Pending Determination Queue"
        >
            <Head title="Approvals" />

            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
                {props.flash?.success && (
                    <div className="mb-8 rounded-2xl bg-green-500 p-4 text-white shadow-lg shadow-green-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <span className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center font-bold">✓</span>
                        <div className="text-sm font-bold uppercase tracking-widest">{props.flash.success}</div>
                    </div>
                )}
                
                <div className="card p-0 overflow-hidden shadow-2xl border border-gray-100 bg-white">
                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Awaiting Verification</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">Actions taken here are cryptographically logged</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Queue depth: {approvals.length}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white border-b border-gray-50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Workflow Step</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity Chain</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payload</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Determination</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {approvals.map((approval) => (
                                    <tr key={`${approval.source_type}-${approval.id}`} className="hover:bg-indigo-50/30 transition-all duration-300 group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <span className={`w-fit px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                    approval.source_type === 'sent_mail' 
                                                        ? (approval.type === 'request' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600')
                                                        : (approval.is_ticket ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600')
                                                }`}>
                                                    {approval.source_type === 'sent_mail' ? approval.category_name : (approval.category?.name || 'Standard')}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="h-5 w-5 rounded-full bg-gray-100 text-gray-400 text-[8px] font-black flex items-center justify-center">
                                                        {approval.current_step}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Current Stage</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-gray-200" />
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-800 leading-none">{approval.sender?.name}</div>
                                                        <div className="text-[9px] text-gray-400 font-medium uppercase mt-1">Initiator</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-indigo-600 shadow-sm shadow-indigo-100" />
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-800 leading-none">
                                                            {approval.source_type === 'sent_mail' ? approval.receiver_email : (approval.receiver?.name || 'External')}
                                                        </div>
                                                        <div className="text-[9px] text-gray-400 font-medium uppercase mt-1">Recipient</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-xs font-bold text-gray-800 truncate max-w-[200px]">
                                                    {approval.subject}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter italic">
                                                    {approval.source_type === 'sent_mail' 
                                                        ? (approval.type === 'request' ? 'OUTBOUND FILE REQUEST' : 'OUTBOUND FILE TRANSMISSION')
                                                        : (approval.is_ticket ? 'INBOUND REQUEST' : (approval.file_path || 'ENCRYPTED_BLOB'))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right space-x-4">
                                            <button 
                                                onClick={() => handleApprove(approval)} 
                                                disabled={processing}
                                                className="px-6 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 transition active:scale-95 disabled:opacity-50"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleReject(approval)} 
                                                disabled={processing}
                                                className="px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 transition active:scale-95 disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                            {approval.source_type === 'legacy' ? (
                                                <Link 
                                                    href={route('transfers.show', approval.id)}
                                                    className="px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition"
                                                >
                                                    Details
                                                </Link>
                                            ) : (
                                                <Link 
                                                    href={route('mail-approvals.edit', approval.id)}
                                                    className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-200 transition"
                                                >
                                                    Review & Edit
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {approvals.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-32 text-center">
                                            <div className="text-indigo-600 mb-6 flex justify-center opacity-20">
                                                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-gray-400 font-black uppercase tracking-[0.2em]">Queue Fully Cleared</p>
                                            <p className="text-[10px] text-gray-300 font-bold uppercase mt-2">All requests have been determined</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
