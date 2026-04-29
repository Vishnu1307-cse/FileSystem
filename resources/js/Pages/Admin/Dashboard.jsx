import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ stats }) {
    return (
        <AuthenticatedLayout
            header="Admin Overview"
        >
            <Head title="Admin Dashboard" />

            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card border-l-4 border-[#7366ff] flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-[#7366ff10] flex items-center justify-center text-2xl">👥</div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
                        </div>
                    </div>
                    <div className="card border-l-4 border-[#51bb25] flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-[#51bb2510] flex items-center justify-center text-2xl">🔄</div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Transfers</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total_transfers}</p>
                        </div>
                    </div>
                    <div className="card border-l-4 border-[#ff9f40] flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-[#ff9f4010] flex items-center justify-center text-2xl">⏳</div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending Approvals</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.pending_approvals}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-bold mb-6 text-gray-800">Management Console</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href={route('admin.users')} className="group p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-[#7366ff50] hover:bg-white hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl group-hover:bg-[#7366ff] group-hover:text-white transition">👤</div>
                                <span className="text-[10px] font-bold text-[#7366ff] bg-[#7366ff10] px-3 py-1 rounded-full uppercase tracking-tighter">Enter Console</span>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2">User & Role Management</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">Add new users, assign specialized roles (HOD, Software/Hardware), and manage system access permissions.</p>
                        </Link>
                        
                        <Link href={route('admin.transfers')} className="group p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-[#7366ff50] hover:bg-white hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl group-hover:bg-[#7366ff] group-hover:text-white transition">🔍</div>
                                <span className="text-[10px] font-bold text-[#7366ff] bg-[#7366ff10] px-3 py-1 rounded-full uppercase tracking-tighter">Monitor Flows</span>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2">Global Transfer Monitoring</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">Live oversight of all system-wide file exchanges and tickets. Monitor approval statuses and participant engagement.</p>
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
