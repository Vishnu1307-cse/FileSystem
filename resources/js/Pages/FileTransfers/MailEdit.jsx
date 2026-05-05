import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function MailEdit({ tracker, sentMail }) {
    const { data, setData, post, processing, errors } = useForm({
        subject: sentMail.subject,
        body: sentMail.body,
        removed_attachments: [],
        new_files: [],
        _method: 'put',
    });

    const getRemainingCount = () => {
        const existingCount = sentMail.attachments ? sentMail.attachments.length : 0;
        return existingCount - data.removed_attachments.length + data.new_files.length;
    };

    const submitSave = (e) => {
        e.preventDefault();
        if (getRemainingCount() < 1) {
            alert('You must leave at least one file attached to this request.');
            return;
        }
        // Force POST for file uploads, _method=put is handled by Laravel
        post(route('mail-approvals.update', tracker.id), { forceFormData: true });
    };

    const handleApprove = () => {
        if (getRemainingCount() < 1) {
            alert('You must leave at least one file attached to this request before approving.');
            return;
        }
        // Temporary change _method to post since the route is POST
        post(route('mail-approvals.approve', tracker.id), { 
            data: { _method: 'post' },
            forceFormData: true 
        });
    };

    const handleReject = () => {
        if (confirm('Are you sure you want to reject this request? The flow will be terminated immediately.')) {
            post(route('mail-approvals.reject', tracker.id), { 
                data: { _method: 'post' },
                forceFormData: true 
            });
        }
    };

    const toggleRemoveAttachment = (attachmentPath) => {
        if (data.removed_attachments.includes(attachmentPath)) {
            setData('removed_attachments', data.removed_attachments.filter(p => p !== attachmentPath));
        } else {
            setData('removed_attachments', [...data.removed_attachments, attachmentPath]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setData('new_files', [...data.new_files, ...Array.from(e.target.files)]);
            e.target.value = ''; // Reset input to allow adding more
        }
    };

    const removeNewFile = (indexToRemove) => {
        setData('new_files', data.new_files.filter((_, index) => index !== indexToRemove));
    };

    return (
        <AuthenticatedLayout
            header={`Review & Edit Mail: ${sentMail.type === 'request' ? 'Request File' : 'Send File'}`}
        >
            <Head title="Review Mail" />

            <div className="mx-auto max-w-5xl pb-20 px-4">
                <div className="card shadow-2xl border border-gray-100 p-6 md:p-8">
                    <div className="mb-8 border-b border-gray-100 pb-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black text-gray-800 uppercase tracking-widest mb-1">
                                Review Content & Attachments
                            </h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                You can modify the subject, body, and attachments before making your decision.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-700">
                                Pending Your Action
                            </span>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600">
                                Level {tracker.level} Approver
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Initiator</label>
                            <div className="text-sm font-bold text-gray-800">{sentMail.sender?.name}</div>
                            <div className="text-xs text-gray-500">{sentMail.sender?.email}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Recipient</label>
                            <div className="text-sm font-bold text-gray-800">{sentMail.receiver}</div>
                        </div>
                    </div>

                    <form onSubmit={submitSave} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="subject" value="Mail Subject" />
                            <TextInput
                                id="subject"
                                type="text"
                                className="mt-1 block w-full bg-white border-gray-200"
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                                required
                            />
                            {errors.subject && <div className="text-red-500 text-xs mt-1">{errors.subject}</div>}
                        </div>

                        <div>
                            <InputLabel htmlFor="body" value="Mail Body Content" />
                            <textarea
                                id="body"
                                className="mt-1 block w-full border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white min-h-[150px]"
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                                required
                            />
                            {errors.body && <div className="text-red-500 text-xs mt-1">{errors.body}</div>}
                        </div>

                        {/* Attachments Section */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-4">Attachments Management</h4>
                            
                            {/* Existing Attachments */}
                            {sentMail.attachments && sentMail.attachments.length > 0 && (
                                <div className="mb-6 space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Existing Files</label>
                                    {sentMail.attachments.map((attachment, idx) => {
                                        const isRemoved = data.removed_attachments.includes(attachment);
                                        return (
                                            <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${isRemoved ? 'bg-red-50 border-red-100 opacity-60' : 'bg-white border-gray-200'}`}>
                                                <div className={`text-xs font-bold ${isRemoved ? 'line-through text-red-400' : 'text-gray-700'} truncate mr-4`}>
                                                    {attachment.split('/').pop().replace(/^[0-9a-f]{13}_/, '')}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleRemoveAttachment(attachment)}
                                                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-md ${isRemoved ? 'bg-gray-200 text-gray-600' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                                                >
                                                    {isRemoved ? 'Restore' : 'Delete'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* New Uploads List */}
                            {data.new_files && data.new_files.length > 0 && (
                                <div className="mb-6 space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Newly Added Files</label>
                                    {data.new_files.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-indigo-50 border-indigo-100">
                                            <div className="text-xs font-bold text-indigo-900 truncate mr-4">
                                                {file.name}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeNewFile(idx)}
                                                className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-md bg-indigo-200 text-indigo-700 hover:bg-indigo-300"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* New Uploads Input */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Upload Additional/Replacement Files</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Total Files Remaining: {getRemainingCount()}
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition"
                            >
                                Save Edits (Without Approving)
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center bg-gray-50 -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 md:p-8 rounded-b-2xl">
                        <Link
                            href={route('transfers.approvals')}
                            className="text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest"
                        >
                            ← Back to Queue
                        </Link>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={handleReject}
                                disabled={processing}
                                className="px-8 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 transition"
                            >
                                Reject Request
                            </button>
                            <button
                                type="button"
                                onClick={handleApprove}
                                disabled={processing}
                                className="px-8 py-3 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 transition"
                            >
                                Approve Request
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
