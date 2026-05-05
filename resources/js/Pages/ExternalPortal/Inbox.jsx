import { Head, Link } from '@inertiajs/react';

export default function Inbox({ user, mails }) {
    const handleLogout = () => {
        window.axios.post('/external/logout')
            .then(() => {
                window.location.href = '/external/login';
            })
            .catch(err => {
                console.error('Logout failed', err);
            });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="External Inbox" />

            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-100 shadow-sm px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        File Portal
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-sm font-bold text-gray-700 uppercase tracking-widest border-r border-gray-100 pr-6">
                            {user.name}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="card p-0 overflow-hidden border border-gray-100 shadow-xl bg-white rounded-xl">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Your Inbox</h3>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{mails.length} Records</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white border-b border-gray-50">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {mails.map((mail) => (
                                    <tr key={mail.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter ${
                                                mail.type === 'request' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {mail.type === 'request' ? 'Request' : 'Receive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-800">{mail.subject}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter ${
                                                mail.type === 'request' 
                                                    ? (mail.upload_status === 'uploaded' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600')
                                                    : 'bg-green-50 text-green-600'
                                            }`}>
                                                {mail.type === 'request' 
                                                    ? (mail.upload_status === 'uploaded' ? 'Completed' : 'Awaiting Upload') 
                                                    : 'Ready'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[10px] font-bold text-gray-400">
                                                {new Date(mail.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link 
                                                href={route('external.mail.show', mail.id)} 
                                                className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {mails.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-16 text-center">
                                            <div className="text-4xl mb-3 opacity-20 flex justify-center text-gray-400">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9l-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No files available in your inbox yet.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
