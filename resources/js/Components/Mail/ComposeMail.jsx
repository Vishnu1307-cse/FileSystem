import React, { useState } from 'react';

export default function ComposeMail({ categories }) {
    const [formData, setFormData] = useState({
        receiver: '',
        cc: '',
        subject: '',
        body: '',
        approval_table_name: '',
    });
    const [attachments, setAttachments] = useState([]);
    const [category_id, setCategoryId] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleFileChange = (e) => {
        setAttachments(Array.from(e.target.files));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.receiver.trim()) newErrors.receiver = 'Receiver is required';
        if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
        if (!formData.approval_table_name.trim()) newErrors.approval_table_name = 'Approval table name is required';
        if (!formData.body.trim()) newErrors.body = 'Body is required';
        if (!category_id) newErrors.category_id = 'Approval category is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');
        
        if (!validate()) return;

        setLoading(true);

        const payload = new FormData();
        payload.append('receiver', formData.receiver);
        if (formData.cc) payload.append('cc', formData.cc);
        payload.append('subject', formData.subject);
        payload.append('approval_table_name', formData.approval_table_name);
        payload.append('body', formData.body);
        
        attachments.forEach(file => {
            payload.append('attachments[]', file);
        });
        
        payload.append('category_id', category_id);

        try {
            // Using existing global axios instance defined in bootstrap.js
            const response = await window.axios.post('/api/send-files', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.status === 201) {
                setSuccessMessage(response.data.message || 'Mail sent and submitted for approval.');
                setFormData({ receiver: '', cc: '', subject: '', body: '', approval_table_name: '' });
                setAttachments([]);
                setCategoryId('');
                const fileInput = document.getElementById('attachments_input');
                if (fileInput) fileInput.value = '';
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'An error occurred while submitting.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Compose Mail for Approval</h2>
            
            {successMessage && (
                <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl font-medium border border-emerald-100">
                    {successMessage}
                </div>
            )}
            
            {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100">
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">To (Receiver) *</label>
                        <input 
                            type="email" 
                            name="receiver"
                            value={formData.receiver}
                            onChange={handleChange}
                            className={`w-full rounded-xl border ${errors.receiver ? 'border-red-500' : 'border-gray-200'} focus:ring-indigo-500 focus:border-indigo-500`}
                            placeholder="receiver@example.com"
                        />
                        {errors.receiver && <p className="text-red-500 text-xs mt-1 font-bold">{errors.receiver}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">CC (Optional)</label>
                        <input 
                            type="text" 
                            name="cc"
                            value={formData.cc}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="cc1@example.com, cc2@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Subject *</label>
                    <input 
                        type="text" 
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full rounded-xl border ${errors.subject ? 'border-red-500' : 'border-gray-200'} focus:ring-indigo-500 focus:border-indigo-500`}
                        placeholder="Mail Subject"
                    />
                    {errors.subject && <p className="text-red-500 text-xs mt-1 font-bold">{errors.subject}</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Approval Table Name *</label>
                    <input 
                        type="text" 
                        name="approval_table_name"
                        value={formData.approval_table_name}
                        onChange={handleChange}
                        className={`w-full rounded-xl border ${errors.approval_table_name ? 'border-red-500' : 'border-gray-200'} focus:ring-indigo-500 focus:border-indigo-500`}
                        placeholder="Approval Table Name"
                    />
                    {errors.approval_table_name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.approval_table_name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Body *</label>
                    <textarea 
                        name="body"
                        value={formData.body}
                        onChange={handleChange}
                        rows="6"
                        className={`w-full rounded-xl border ${errors.body ? 'border-red-500' : 'border-gray-200'} focus:ring-indigo-500 focus:border-indigo-500`}
                        placeholder="Mail body content..."
                    />
                    {errors.body && <p className="text-red-500 text-xs mt-1 font-bold">{errors.body}</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Attachments (Optional)</label>
                    <input 
                        id="attachments_input"
                        type="file" 
                        multiple
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition"
                    />
                </div>

                <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Approval Workflow</h3>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Select Category *</label>
                        <select 
                            value={category_id}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className={`w-full rounded-xl border ${errors.category_id ? 'border-red-500' : 'border-gray-200'} focus:ring-indigo-500 focus:border-indigo-500`}
                        >
                            <option value="">-- Select Predefined Workflow --</option>
                            {categories?.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.category_id && <p className="text-red-500 text-xs mt-1 font-bold">{errors.category_id}</p>}
                        <p className="text-xs text-gray-400 mt-2 italic">Choosing a category will use the approval chain defined by the administrator.</p>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                    >
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </form>
        </div>
    );
}
