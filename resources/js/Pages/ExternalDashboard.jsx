import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function ExternalDashboard({ stats, recentLogs }) {
    const StatCard = ({ title, value, color, icon }) => (
        <div className={`card border-l-4 ${color} flex items-center justify-between`}>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl opacity-80 shadow-sm ${color.replace('border-', 'bg-').replace('-600', '-50')}`}>
                {icon}
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            header="External Portal Overview"
        >
            <Head title="Portal Dashboard" />

            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <StatCard 
                        title="Files Sent" 
                        value={stats.sent_total} 
                        color="border-emerald-600" 
                        icon={<svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
                    />
                    <StatCard 
                        title="File Requests (Received)" 
                        value={stats.received_total} 
                        color="border-indigo-600" 
                        icon={<svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>}
                    />
                </div>

                {/* Activity Logs */}
                <div className="card p-0 overflow-hidden shadow-xl border border-gray-100">
                    <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">Recent Activity Logs</h3>
                        <Link href={route('inbox.index')} className="text-[10px] font-bold text-indigo-600 uppercase hover:underline">Full Transaction History</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white border-b border-gray-50">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Direction</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Participant / Subject</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentLogs.map((log) => (
                                    <tr key={`${log.is_mail ? 'mail' : 'trans'}-${log.id}`} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter ${
                                                log.is_outbound ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                                            }`}>
                                                {log.is_outbound ? 'Sent' : 'Received'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-800">
                                                {log.is_outbound 
                                                    ? (log.is_mail ? log.receiver : log.receiver?.email)
                                                    : (log.sender?.email || log.sender?.name || 'System')}
                                            </div>
                                            <div className="text-[10px] text-gray-400 uppercase font-bold">{log.subject}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${
                                                log.is_mail ? 'bg-indigo-100 text-indigo-700' :
                                                log.is_ticket ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {log.is_mail ? 'Mail' : (log.is_ticket ? 'Ticket Request' : 'Direct Transfer')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter ${
                                                log.action_type === 'Download' ? 'bg-green-100 text-green-700' : 
                                                log.action_type === 'Upload' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {log.action_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-gray-400">
                                            {new Date(log.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <Link 
                                                href={log.is_mail ? route('external.mail.show', log.id) : route('external.transfer.show', log.id)} 
                                                className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest"
                                            >
                                                View Details
                                            </Link>
                                            {!log.is_outbound && log.is_ticket && !log.is_closed && log.status === 'approved' && (
                                                <Link href={route('tickets.upload')} className="text-[10px] font-bold text-green-600 hover:underline uppercase tracking-widest">Upload Now</Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {recentLogs.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="text-4xl mb-3 opacity-20 flex justify-center text-gray-400">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-50">No activity found</p>
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
