import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function MyApprovals({ auth, approvals }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">My Approvals</h2>}
        >
            <Head title="My Approvals" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-bold mb-4">Past Actions</h3>
                            
                            {approvals.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    No approval history found.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Subject</th>
                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Sender</th>
                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">My Action</th>
                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Acted On</th>
                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Overall Status</th>
                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">View</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {approvals.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50/50 transition">
                                                    <td className="p-4 font-bold text-sm text-gray-800">{item.subject}</td>
                                                    <td className="p-4 text-sm text-gray-600">{item.sender?.name || 'Unknown'}</td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                            item.my_action === 'approved' ? 'bg-[#51bb2515] text-[#51bb25]' :
                                                            item.my_action === 'rejected' ? 'bg-[#fd2e6415] text-[#fd2e64]' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                            {item.my_action}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500">
                                                        {item.acted_at ? new Date(item.acted_at).toLocaleDateString() : 'Unknown'}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                                                            item.overall_status === 'approved' ? 'text-green-600' :
                                                            item.overall_status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                                                        }`}>
                                                            {item.overall_status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <Link 
                                                            href={route('mails.show', item.mail_id)}
                                                            className="text-indigo-600 hover:text-indigo-900 text-sm font-bold"
                                                        >
                                                            View Details
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
