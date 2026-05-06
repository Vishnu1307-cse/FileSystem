import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function FileItem({ fileName, mailId, mail }) {
    const [step, setStep] = useState('auth_required'); // auth_required, otp_sent
    const [uid, setUid] = useState('');
    const [password, setPassword] = useState('');
    const [otpValue, setOtpValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleAuthSubmit = (e) => {
        e.preventDefault();
        if (mail.is_expired) return;
        setLoading(true);
        setMessage({ text: '', type: '' });

        window.axios.post(`/external/mails/${mailId}/request-download-otp`, { uid, password })
            .then(response => {
                setStep('otp_sent');
                setMessage({ text: response.data.message, type: 'success' });
            })
            .catch(err => {
                setMessage({ text: err.response?.data?.message || 'Invalid credentials.', type: 'error' });
            })
            .finally(() => setLoading(false));
    };

    const handleDownload = (e) => {
        e.preventDefault();
        if (mail.is_expired) return;
        setLoading(true);
        setMessage({ text: '', type: '' });

        window.axios.post(`/external/mails/${mailId}/download`, { uid, password, otp: otpValue }, { responseType: 'blob' })
            .then(response => {
                // Trigger browser download
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName.split('/').pop().replace(/^[0-9a-f]{13}_/, ''));
                document.body.appendChild(link);
                link.click();
                link.remove();

                setStep('auth_required');
                setUid('');
                setPassword('');
                setOtpValue('');
                setMessage({ text: 'Download started successfully.', type: 'success' });
            })
            .catch(async (err) => {
                // Handle blob error response
                let errorMessage = 'Invalid OTP or download failed.';
                if (err.response?.data instanceof Blob) {
                    const text = await err.response.data.text();
                    try {
                        const json = JSON.parse(text);
                        errorMessage = json.message || errorMessage;
                    } catch (e) { }
                }
                setMessage({ text: errorMessage, type: 'error' });
            })
            .finally(() => setLoading(false));
    };

    if (mail.is_expired) {
        return (
            <div className="p-4 border border-red-100 rounded-xl bg-red-50/50 flex flex-col gap-2 transition-all shadow-sm grayscale opacity-70">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">📄</span>
                        <div className="text-sm font-bold text-gray-400 line-through truncate max-w-xs">
                            {fileName.split('/').pop().replace(/^[0-9a-f]{13}_/, '')}
                        </div>
                    </div>
                    <span className="text-[9px] font-black bg-red-500 text-white px-2 py-0.5 rounded uppercase tracking-widest">Time expired</span>
                </div>
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Access for this file has timed out.</p>
            </div>
        );
    }

    return (
        <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-col gap-3 transition-all hover:border-indigo-100 shadow-sm">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <div className="text-sm font-bold text-gray-700 truncate max-w-xs">
                        {fileName.split('/').pop().replace(/^[0-9a-f]{13}_/, '')}
                    </div>
                </div>
            </div>

            {step === 'auth_required' && (
                <form onSubmit={handleAuthSubmit} className="mt-2 p-3 bg-white rounded-lg border border-indigo-50 flex flex-col gap-3 animate-fade-in">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Enter Credentials to Request OTP</p>
                    <div className="flex flex-col md:flex-row gap-2">
                        <input
                            type="text"
                            value={uid}
                            onChange={(e) => setUid(e.target.value)}
                            placeholder="User ID"
                            className="flex-1 rounded-lg border-gray-200 text-sm font-bold"
                            required
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="flex-1 rounded-lg border-gray-200 text-sm font-bold"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {loading ? '...' : 'Verify & Send OTP'}
                        </button>
                    </div>
                </form>
            )}

            {step === 'otp_sent' && (
                <form onSubmit={handleDownload} className="mt-2 p-3 bg-white rounded-lg border border-indigo-50 flex flex-col gap-3 animate-fade-in">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Enter the OTP sent to your email</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value)}
                            maxLength={6}
                            placeholder="000000"
                            className="flex-1 rounded-lg border-gray-200 text-center font-bold tracking-[4px]"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-green-700 transition"
                        >
                            {loading ? '...' : 'Confirm & Download'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setStep('auth_required'); setOtpValue(''); setMessage({ text: '', type: '' }); }}
                            className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {message.text && (
                <div className={`text-[10px] font-bold uppercase tracking-tighter ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}

function UploadSection({ mailId, currentStatus }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [status, setStatus] = useState(currentStatus); // awaiting, uploaded

    const handleUpload = (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setMessage({ text: '', type: '' });

        const formData = new FormData();
        formData.append('file', file);

        window.axios.post(`/external/mails/${mailId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(response => {
                setMessage({ text: response.data.message, type: 'success' });
                setStatus('uploaded');
            })
            .catch(err => {
                setMessage({ text: err.response?.data?.message || 'Upload failed.', type: 'error' });
            })
            .finally(() => setLoading(false));
    };

    if (status === 'uploaded') {
        return (
            <div className="bg-green-50 border border-green-100 p-6 rounded-2xl text-center animate-fade-in">
                <span className="text-2xl block mb-2">✅</span>
                <p className="text-sm font-bold text-green-600 uppercase tracking-widest">File uploaded successfully.</p>
                <p className="text-xs text-green-500 mt-1 italic">You have already submitted your response for this request.</p>
            </div>
        );
    }

    return (
        <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-2xl">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[3px] mb-6">Upload Your Response</h3>
            <form onSubmit={handleUpload} className="space-y-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-xl p-8 hover:bg-indigo-50 transition cursor-pointer relative bg-white group">
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        required
                    />
                    <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">📤</span>
                    <span className="text-sm font-bold text-gray-700">
                        {file ? file.name : "Click to select a file or drag and drop"}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Max size: 10MB</span>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-lg text-xs font-bold uppercase tracking-widest ${message.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !file}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold uppercase tracking-[3px] hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-[0.98]"
                >
                    {loading ? "Uploading..." : "Submit File"}
                </button>
            </form>
        </div>
    );
}

export default function Show({ auth, mail }) {
    const user = auth.user;
    const attachments = mail.attachments || [];

    return (
        <AuthenticatedLayout
            user={user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{mail.subject}</h2>}
        >
            <Head title={mail.subject} />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={route('inbox.index')}
                            className="text-xs font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-[2px] transition flex items-center gap-2"
                        >
                            <span>←</span> Back to Inbox
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30">
                            <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">{mail.subject}</h1>
                            <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-gray-400">From: <span className="text-indigo-600">{mail.sender?.email || 'Internal Team'}</span></span>
                                <span className="text-gray-400">Date: <span className="text-gray-600">{new Date(mail.created_at).toLocaleString()}</span></span>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="mb-10">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[3px] mb-4">Message Content</h3>
                                <div className="bg-gray-50 p-6 rounded-2xl text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-50">
                                    {mail.body}
                                    {mail.type !== 'request' && mail.plain_credential_password && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">
                                                In order to download the file, please use the Credentials below and query for an otp
                                            </p>
                                            <p className="text-xs font-black text-gray-800">
                                                User ID: {mail.receiver.split('@')[0]}<br />
                                                Password: {mail.plain_credential_password}<br />
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {mail.type === 'request' && (
                                <div className="mb-10 animate-in slide-in-from-top-4 duration-500">
                                    <UploadSection mailId={mail.id} currentStatus={mail.upload_status} />
                                </div>
                            )}

                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[3px] mb-4">Secure Attachments</h3>
                                {attachments.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">No files attached to this mail.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {attachments.map((file, index) => (
                                            <FileItem key={index} fileName={file} mailId={mail.id} mail={mail} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-12 pt-8 border-t border-gray-50 flex gap-4">
                                <Link
                                    href={route('external.mail.reply', mail.id)}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-center font-bold py-4 px-6 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    Reply to this Mail
                                </Link>
                                <button
                                    onClick={() => window.history.back()}
                                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold py-4 px-6 rounded-2xl transition-all active:scale-95"
                                >
                                    Back to Inbox
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
