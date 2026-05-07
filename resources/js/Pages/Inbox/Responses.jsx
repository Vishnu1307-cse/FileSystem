import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Responses({ responses }) {
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

    const filteredResponses = (responses || []).filter(item => {
        const query = searchQuery.toLowerCase();
        return (
            (item.subject || '').toLowerCase().includes(query) ||
            (item.body || '').toLowerCase().includes(query) ||
            (item.sender?.name || '').toLowerCase().includes(query) ||
            (item.sender?.email || '').toLowerCase().includes(query) ||
            (item.parent?.subject || '').toLowerCase().includes(query)
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
        <AuthenticatedLayout
            header="Responses from Customers"
        >
            <Head title="Customer Responses" />

            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
                <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm animate-fade-in">
                    <div className="relative w-full sm:w-72">
                        <input
                            type="text"
                            placeholder="Search customer responses..."
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

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Incoming Customer Replies</h3>
                        <span className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-tighter">
                            {filteredResponses.length} Records
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white border-b border-gray-50">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer (Sender)</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Original Mail Subject</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reply Details</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Received</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredResponses.map((res) => {
                                    const itemKey = `m-${res.id}`;
                                    const isUnviewed = !viewedItems.includes(itemKey);

                                    return (
                                        <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-800 text-sm">{res.sender?.name || 'Customer'}</div>
                                                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{res.sender?.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {res.parent ? (
                                                    <>
                                                        <div className="text-sm font-medium text-gray-600 italic">"{res.parent.subject}"</div>
                                                        <Link 
                                                            href={route('mails.show', res.parent.id)} 
                                                            className="text-[9px] font-bold text-indigo-500 hover:underline uppercase tracking-widest mt-1 inline-block"
                                                        >
                                                            View Original Request
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <div className="text-sm text-gray-400 italic">N/A (Legacy Reply)</div>
                                                )}
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
                                                        <div className="text-sm font-bold text-gray-800 mb-1">{res.subject}</div>
                                                        <div className="text-xs text-gray-500 line-clamp-2 max-w-xs">{res.body}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[10px] font-bold text-gray-400">
                                                {new Date(res.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link 
                                                    href={route('mails.show', res.id)} 
                                                    onClick={() => markAsViewed(itemKey)}
                                                    className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-[2px]"
                                                >
                                                    View Full Message
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredResponses.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="text-3xl mb-3 opacity-20">📩</div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-50">No customer responses found</p>
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
