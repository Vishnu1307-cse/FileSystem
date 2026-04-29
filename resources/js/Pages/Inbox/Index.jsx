import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ received, sent, teamSent, isHod }) {
    const renderTable = (items, title, emptyMsg) => (
        <div className="card p-0 overflow-hidden mb-10 border border-gray-100 shadow-xl">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs shadow-lg shadow-indigo-100">
                        {title.includes('Received') ? '📥' : (title.includes('Team') ? '👥' : '📤')}
                    </div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">{title}</h3>
                </div>
                <span className="text-[10px] font-bold text-[#7366ff] bg-[#7366ff10] px-3 py-1 rounded-full">{items.length} Records</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white border-b border-gray-50">
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title.includes('Received') ? 'Sender' : 'Receiver'}</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {items.map((item) => (
                            <tr key={`${item.is_ticket ? 't' : 'f'}-${item.id}`} className="hover:bg-[#7366ff05] transition-colors group">
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${item.is_ticket ? 'bg-[#ff9f4015] text-[#ff9f40]' : 'bg-[#167dff15] text-[#167dff]'}`}>
                                        {item.is_ticket ? 'Ticket' : 'File'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-gray-800">{title.includes('Received') ? item.sender?.email : item.receiver?.email}</div>
                                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{title.includes('Received') ? item.sender?.name : item.receiver?.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter ${
                                        item.status === 'approved' ? 'bg-[#51bb2510] text-[#51bb25]' :
                                        item.status === 'rejected' ? 'bg-[#fd2e6410] text-[#fd2e64]' : 'bg-[#ff9f4010] text-[#ff9f40]'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-[10px] font-bold text-gray-400">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={route('transfers.show', item.id)} className="text-[10px] font-bold text-[#7366ff] hover:underline uppercase tracking-widest">View Details</Link>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-16 text-center">
                                    <div className="text-4xl mb-3 opacity-20 flex justify-center text-gray-400">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{emptyMsg}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout header="Transaction History">
            <Head title="Inbox" />
            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
                {renderTable(received, "Items Received", "No inbound transfers found.")}
                {renderTable(sent, "Items Sent", "You haven't initiated any transfers.")}
                {isHod && renderTable(teamSent, "Team Oversight (HOD View)", "No team transfers recorded.")}
            </div>
        </AuthenticatedLayout>
    );
}
