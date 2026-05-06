import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ mail }) {
    return (
        <AuthenticatedLayout header={`Mail Details: ${mail.subject}`}>
            <Head title={`Mail: ${mail.subject}`} />
            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
                <div className="mb-6">
                    <Link href={route('inbox.index')} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
                        ← Back to Inbox
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{mail.subject}</h2>
                                <div className="mt-2 space-y-1 text-sm">
                                    <div className="text-gray-500"><span className="font-bold text-gray-700 w-16 inline-block">From:</span> {mail.sender?.name} &lt;{mail.sender?.email}&gt;</div>
                                    <div className="text-gray-500"><span className="font-bold text-gray-700 w-16 inline-block">To:</span> {mail.receiver}</div>
                                    {mail.cc && <div className="text-gray-500"><span className="font-bold text-gray-700 w-16 inline-block">CC:</span> {mail.cc}</div>}
                                    <div className="text-gray-500"><span className="font-bold text-gray-700 w-16 inline-block">Date:</span> {new Date(mail.created_at).toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${mail.overall_status === 'approved' ? 'bg-[#51bb2515] text-[#51bb25]' :
                                        mail.overall_status === 'rejected' ? 'bg-[#fd2e6415] text-[#fd2e64]' : 'bg-[#ff9f4015] text-[#ff9f40]'
                                    }`}>
                                    Status: {mail.overall_status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50/50 min-h-[150px]">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Message Body</h3>
                        <div className="text-gray-700 whitespace-pre-wrap">{mail.body}</div>
                    </div>

                    {mail.attachments && mail.attachments.length > 0 && (
                        <div className="p-6 border-t border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Attachments</h3>
                            <div className="flex flex-wrap gap-4">
                                {mail.attachments.map((path, index) => {
                                    const filename = path.split('/').pop().replace(/^[0-9a-f]{13}_/, '');
                                    const isExpired = mail.is_expired;
                                    
                                    const content = (
                                        <>
                                            <div className={`h-10 w-10 ${isExpired ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white'} rounded-lg flex items-center justify-center transition`}>
                                                📄
                                            </div>
                                            <div>
                                                <div className={`text-sm font-bold ${isExpired ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{filename.substring(0, 20)}{filename.length > 20 ? '...' : ''}</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{isExpired ? 'Time expired' : 'Download'}</div>
                                            </div>
                                        </>
                                    );

                                    return isExpired ? (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-not-allowed opacity-60">
                                            {content}
                                        </div>
                                    ) : (
                                        <a key={index} href={route('mails.download', { mail: mail.id, index })} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition group">
                                            {content}
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Approval Tracking Chain</h3>
                    </div>
                    <div className="p-6">
                        {mail.trackers && mail.trackers.length > 0 ? (
                            <div className="space-y-6">
                                {mail.trackers.map((tracker, index) => (
                                    <div key={tracker.id} className="flex gap-4 relative">
                                        {index !== mail.trackers.length - 1 && (
                                            <div className="absolute top-8 left-4 bottom-[-1.5rem] w-0.5 bg-gray-200"></div>
                                        )}
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${tracker.status === 'approved' ? 'bg-white border-[#51bb25] text-[#51bb25]' :
                                                tracker.status === 'rejected' ? 'bg-white border-[#fd2e64] text-[#fd2e64]' : 'bg-gray-100 border-gray-300 text-gray-400'
                                            }`}>
                                            {tracker.status === 'approved' ? '✓' : (tracker.status === 'rejected' ? '✕' : '⏳')}
                                        </div>
                                        <div className="pb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-sm text-gray-800">{tracker.name}</div>
                                                <div className="text-xs text-gray-500">&lt;{tracker.email}&gt;</div>
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${tracker.status === 'approved' ? 'bg-[#51bb2510] text-[#51bb25]' :
                                                        tracker.status === 'rejected' ? 'bg-[#fd2e6410] text-[#fd2e64]' : 'bg-[#ff9f4010] text-[#ff9f40]'
                                                    }`}>
                                                    {tracker.status}
                                                </span>
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Level {tracker.level}</div>
                                            {tracker.last_approved && (
                                                <div className="text-xs text-gray-500 mt-1">Acted on: {new Date(tracker.last_approved).toLocaleString()}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 italic">No trackers found for this mail.</div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
