import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Reply({ originalMail, user }) {
    const { data, setData, post, processing, errors } = useForm({
        subject: `Re: ${originalMail.subject}`,
        body: '',
        cc: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('external.mail.reply.submit', originalMail.id));
    };

    return (
        <AuthenticatedLayout
            header={`Reply to: ${originalMail.subject}`}
        >
            <Head title="Reply to Mail" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Read-only Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Sender</label>
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-600 text-sm font-medium">
                                            {user.name} ({user.email})
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Receiver</label>
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-600 text-sm font-medium">
                                            {originalMail.sender.name} ({originalMail.sender.email})
                                        </div>
                                    </div>
                                </div>

                                {/* CC */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">CC (comma separated emails)</label>
                                    <input
                                        type="text"
                                        value={data.cc}
                                        onChange={e => setData('cc', e.target.value)}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g. colleague@example.com, manager@example.com"
                                    />
                                    {errors.cc && <div className="text-red-500 text-xs mt-1 font-medium">{errors.cc}</div>}
                                </div>

                                {/* Body */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Message Body</label>
                                    <textarea
                                        rows="8"
                                        value={data.body}
                                        onChange={e => setData('body', e.target.value)}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Write your reply here..."
                                        required
                                    ></textarea>
                                    {errors.body && <div className="text-red-500 text-xs mt-1 font-medium">{errors.body}</div>}
                                </div>

                                {/* Submit */}
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        Send Reply
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
