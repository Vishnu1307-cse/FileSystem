import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Inbox({ received }) {
    const { auth } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const userId = auth?.user?.id || 'guest';
    const storageKey = `viewed_items_${userId}`;
    const [viewedItems, setViewedItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(storageKey) || '[]');
        } catch (e) {
            return [];
        }
    });

    const markAsViewed = (itemId) => {
        const updated = [...new Set([...viewedItems, itemId])];
        setViewedItems(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    const filteredReceived = (received || []).filter(item => {
        const query = searchQuery.toLowerCase();
        return (
            (item.subject || '').toLowerCase().includes(query) ||
            (item.message || item.body || '').toLowerCase().includes(query) ||
            (item.sender?.name || '').toLowerCase().includes(query) ||
            (item.sender?.email || '').toLowerCase().includes(query) ||
            (item.is_ticket ? 'ticket' : (item.is_mail ? 'mail' : 'file')).includes(query)
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

    const renderTable = (items, title, emptyMsg) => (
        <div className="card p-0 overflow-hidden mb-10 border border-gray-100 shadow-xl">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs shadow-lg shadow-indigo-100">
                        📥
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
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Title</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject / Description</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sender</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {items.map((item) => {
                            const itemKey = `${item.is_ticket ? 't' : (item.is_mail ? 'm' : 'f')}-${item.id}`;
                            const isUnviewed = !viewedItems.includes(itemKey);

                            return (
                                <tr key={itemKey} className="hover:bg-[#7366ff05] transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${item.is_ticket ? 'bg-[#ff9f4015] text-[#ff9f40]' : (item.is_mail ? 'bg-[#7366ff15] text-[#7366ff]' : 'bg-[#167dff15] text-[#167dff]')}`}>
                                            {item.is_ticket ? 'Ticket' : (item.is_mail ? 'Mail' : 'File')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 relative">
                                        <div className="flex items-center gap-3">
                                            {isUnviewed && (
                                                <span 
                                                    className="w-1.5 h-6 bg-rose-500 rounded-full inline-block flex-shrink-0 animate-pulse" 
                                                    style={{ minWidth: '6px' }}
                                                    title="New Unread Item" 
                                                />
                                            )}
                                            <div>
                                                <div className="text-sm font-bold text-gray-800">{item.subject || 'No Title'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[10px] text-gray-400 font-medium truncate max-w-xs">{item.message || item.body || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-800">{item.sender?.email}</div>
                                        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{item.sender?.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.is_mail && item.trackers && item.trackers.length > 0 ? (
                                            <div className="flex flex-col gap-1.5">
                                                {item.trackers.map((tracker) => (
                                                    <div key={tracker.id} className="flex items-center gap-2 whitespace-nowrap">
                                                        <span className="text-[8px] font-bold text-gray-500 uppercase">{tracker.name}:</span>
                                                        <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-tighter ${
                                                            tracker.status === 'approved' ? 'bg-[#51bb2510] text-[#51bb25]' :
                                                            tracker.status === 'rejected' ? 'bg-[#fd2e6410] text-[#fd2e64]' : 'bg-[#ff9f4010] text-[#ff9f40]'
                                                        }`}>
                                                            {tracker.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter ${
                                                item.status === 'approved' ? 'bg-[#51bb2510] text-[#51bb25]' :
                                                item.status === 'rejected' ? 'bg-[#fd2e6410] text-[#fd2e64]' : 'bg-[#ff9f4010] text-[#ff9f40]'
                                            }`}>
                                                {item.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[10px] font-bold text-gray-400">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link 
                                            href={
                                                (['vendor', 'customer'].includes(auth.user.role?.slug))
                                                    ? (item.is_mail ? route('external.mail.show', item.id) : route('external.transfer.show', item.id))
                                                    : (item.is_mail ? route('mails.show', item.id) : route('transfers.show', item.id))
                                            } 
                                            onClick={() => markAsViewed(itemKey)}
                                            className="text-[10px] font-bold text-[#7366ff] hover:underline uppercase tracking-widest"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-16 text-center">
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
        <AuthenticatedLayout header="My Inbox">
            <Head title="Inbox" />
            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm animate-fade-in">
                    <div className="relative w-full sm:w-72">
                        <input
                            type="text"
                            placeholder="Search inbox..."
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
                {renderTable(filteredReceived, "Received Items", "No inbound transfers found.")}
            </div>
        </AuthenticatedLayout>
    );
}
