import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function ExternalSent({ sent }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const filteredSent = (sent || []).filter(item => {
        const query = searchQuery.toLowerCase();
        return (
            (item.subject || '').toLowerCase().includes(query) ||
            (item.message || item.body || '').toLowerCase().includes(query) ||
            (item.receiver?.name || '').toLowerCase().includes(query) ||
            (item.receiver?.email || '').toLowerCase().includes(query) ||
            (item.receiver || '').toLowerCase().includes(query)
        );
    }).sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.created_at) - new Date(a.created_at);
        }
        if (sortBy === 'oldest') {
            return new Date(a.created_at) - new Date(b.created_at);
        }
        if (sortBy === 'alphabetical_asc') {
            return (a.subject || '').localeCompare(b.subject || '');
        }
        if (sortBy === 'alphabetical_desc') {
            return (b.subject || '').localeCompare(a.subject || '');
        }
        return 0;
    });

    return (
        <AuthenticatedLayout header="Portal Outbox">
            <Head title="Sent Items" />
            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm animate-fade-in">
                    <div className="relative w-full sm:w-72">
                        <input
                            type="text"
                            placeholder="Search sent items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <span className="text-[10px] font-black uppercase text-gray-400 whitespace-nowrap">Sort By:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full sm:w-48 py-2 px-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="alphabetical_asc">Alphabetical (A-Z)</option>
                            <option value="alphabetical_desc">Alphabetical (Z-A)</option>
                        </select>
                    </div>
                </div>

                <div className="card p-0 overflow-hidden mb-10 border border-gray-100 shadow-xl">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs shadow-lg shadow-emerald-100">
                                📤
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Sent Items</h3>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{filteredSent.length} Items</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white border-b border-gray-50">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Receiver</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredSent.map((item) => (
                                    <tr key={`${item.is_ticket ? 't' : 'f'}-${item.id}`} className="hover:bg-emerald-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-800">{item.subject || 'No Title'}</div>
                                            <div className="text-[10px] text-gray-400 font-medium truncate max-w-xs">{item.message || item.body || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-800">{item.receiver?.email || item.receiver || 'Internal Team'}</div>
                                            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{item.receiver?.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[10px] font-bold text-gray-400">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link 
                                                href={item.is_mail ? route('external.mail.show', item.id) : route('external.transfer.show', item.id)} 
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black py-2 px-4 rounded-lg shadow-lg shadow-emerald-100 transition-all uppercase tracking-widest"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filteredSent.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-16 text-center">
                                            <div className="text-4xl mb-3 opacity-20 flex justify-center text-gray-400">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No sent items found.</p>
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
