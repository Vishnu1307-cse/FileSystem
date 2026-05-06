import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Responses({ responses }) {
    return (
        <AuthenticatedLayout
            header="Responses from Customers"
        >
            <Head title="Customer Responses" />

            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Incoming Customer Replies</h3>
                        <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            {responses.length} Total
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
                                {responses.map((res) => (
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
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-800 mb-1">{res.subject}</div>
                                            <div className="text-xs text-gray-500 line-clamp-2 max-w-xs">{res.body}</div>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-gray-400">
                                            {new Date(res.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link 
                                                href={route('mails.show', res.id)} 
                                                className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-[2px]"
                                            >
                                                View Full Message
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {responses.length === 0 && (
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
