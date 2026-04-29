import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Transfers({ transfers }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Global Approval Flow Monitoring</h2>}
        >
            <Head title="Global Transfers" />

            <div className="py-6">
                <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
                    <div className="card p-0 overflow-hidden shadow-xl border border-gray-100">
                        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 uppercase text-sm tracking-wider">All System Transfers</h3>
                            <span className="text-xs text-gray-500">Total Records: {transfers.length}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sender</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Receiver</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Approver</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transfers.map((t) => (
                                        <tr key={`${t.is_ticket ? 't' : 'f'}-${t.id}`} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${t.is_ticket ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {t.is_ticket ? 'TICKET' : 'FILE'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-gray-900">{t.sender.email}</td>
                                            <td className="px-6 py-4 text-xs text-gray-600">{t.receiver.email}</td>
                                            <td className="px-6 py-4 text-xs text-gray-600">{t.approver?.email || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-[9px] font-bold rounded-full ${
                                                    t.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    t.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {t.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[10px] text-gray-500">
                                                {new Date(t.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium">
                                                <Link href={route('transfers.show', t.id)} className="text-indigo-600 hover:text-indigo-900 font-bold">VIEW</Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {transfers.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500 text-sm italic">No transfers found in the system.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
