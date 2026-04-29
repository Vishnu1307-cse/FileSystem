import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function EmployeeDashboard({ sentStats, receivedTotal, pendingApprovalsCount, recentLogs }) {
    const user = usePage().props.auth.user;

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
            header="Employee Dashboard"
        >
            <Head title="Dashboard" />

            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard 
                        title="Total Sent" 
                        value={sentStats.total} 
                        color="border-indigo-600" 
                        icon={<svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
                    />
                    <StatCard 
                        title="In Approval" 
                        value={sentStats.pending} 
                        color="border-yellow-600" 
                        icon={<svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    {['software', 'hardware', 'hod'].includes(user.super_role) && (
                        <StatCard 
                            title="Action Required" 
                            value={pendingApprovalsCount} 
                            color="border-red-600" 
                            icon={<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                        />
                    )}
                    <StatCard 
                        title="Total Received" 
                        value={receivedTotal} 
                        color="border-green-600" 
                        icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" /></svg>}
                    />
                </div>

                <div className="flex gap-4 mb-8">
                    <Link href={route('transfers.compose')} className="btn-primary flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg> Compose Transfer
                    </Link>
                    <Link href={route('transfers.compose') + '?type=ticket'} className="px-6 py-2.5 rounded-xl border border-indigo-100 font-bold text-indigo-600 text-sm hover:bg-indigo-50 transition flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg> Raise Ticket
                    </Link>
                </div>

                <div className="card p-0 overflow-hidden shadow-xl border border-gray-100">
                    <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">Recent Outbound Activity</h3>
                        <Link href={route('inbox.index')} className="text-[10px] font-bold text-indigo-600 uppercase hover:underline">View All History</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white border-b border-gray-50">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Receiver</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Engagement</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-800">{log.receiver?.email || 'Unknown'}</div>
                                            <div className="text-[10px] text-gray-400 uppercase font-bold">{log.receiver?.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter ${
                                                log.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                log.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">{log.is_ticket ? 'Ticket' : 'File'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-4">
                                                <div className="text-center">
                                                    <div className="text-xs font-bold text-gray-700">{log.view_count || 0}</div>
                                                    <div className="text-[9px] text-gray-400 uppercase font-bold">Views</div>
                                                </div>
                                                <div className="text-center border-l pl-4">
                                                    <div className="text-xs font-bold text-gray-700">{log.download_count || 0}</div>
                                                    <div className="text-[9px] text-gray-400 uppercase font-bold">DLS</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={route('transfers.show', log.id)} className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest">Details</Link>
                                        </td>
                                    </tr>
                                ))}
                                {recentLogs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="text-4xl mb-3 opacity-20 flex justify-center text-gray-400">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-50">No recent activity found</p>
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
