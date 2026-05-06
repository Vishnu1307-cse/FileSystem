import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Settings({ settings }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        file_expiration_days: settings.file_expiration_days || 0,
        file_expiration_hours: settings.file_expiration_hours || 0,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('manage.settings.update'));
    };

    return (
        <AuthenticatedLayout
            header="System Settings"
        >
            <Head title="System Settings" />

            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
                <div className="max-w-2xl">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                <span className="text-indigo-600">⏱</span> Set File Expiration Timer
                            </h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                Define the duration after which uploaded files are automatically deleted.
                            </p>
                        </div>

                        <div className="p-8">
                            <form onSubmit={submit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Expiration Days</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.file_expiration_days}
                                                onChange={e => setData('file_expiration_days', e.target.value)}
                                                className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Days</span>
                                        </div>
                                        {errors.file_expiration_days && <p className="mt-1 text-xs text-red-500 font-bold uppercase tracking-tighter">{errors.file_expiration_days}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Expiration Hours</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max="23"
                                                value={data.file_expiration_hours}
                                                onChange={e => setData('file_expiration_hours', e.target.value)}
                                                className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hours</span>
                                        </div>
                                        {errors.file_expiration_hours && <p className="mt-1 text-xs text-red-500 font-bold uppercase tracking-tighter">{errors.file_expiration_hours}</p>}
                                    </div>
                                </div>

                                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                    <div className="flex gap-3">
                                        <div className="text-xl">ℹ️</div>
                                        <div>
                                            <p className="text-xs font-bold text-indigo-900 leading-relaxed uppercase tracking-tighter">Current Rule:</p>
                                            <p className="text-sm font-medium text-indigo-700 mt-1 italic">
                                                Files will be deleted exactly <span className="font-bold underline">{data.file_expiration_days} days and {data.file_expiration_hours} hours</span> after the mail is sent.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 text-[10px] uppercase tracking-[2px]"
                                    >
                                        {processing ? 'Updating...' : 'Save Timer Settings'}
                                    </button>

                                    {recentlySuccessful && (
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-fade-in">
                                            ✓ Saved Successfully
                                        </span>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
