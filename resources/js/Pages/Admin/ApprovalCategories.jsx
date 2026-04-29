import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useState } from 'react';

export default function ApprovalCategories({ categories, internalUsers }) {
    const [editingCategory, setEditingCategory] = useState(null);
    const [showCreate, setShowCreate] = useState(false);

    const { data, setData, post, patch, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        approvers: [] // [{user_id: ''}]
    });

    const handleEdit = (category) => {
        setEditingCategory(category);
        setData({
            approvers: category.sequences.map(s => ({ user_id: s.user_id }))
        });
    };

    const addApprover = () => {
        setData('approvers', [...data.approvers, { user_id: '' }]);
    };

    const removeApprover = (index) => {
        const newApprovers = [...data.approvers];
        newApprovers.splice(index, 1);
        setData('approvers', newApprovers);
    };

    const updateApproverUser = (index, userId) => {
        const newApprovers = [...data.approvers];
        newApprovers[index].user_id = userId;
        setData('approvers', newApprovers);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('admin.approval_categories.store'), {
            onSuccess: () => {
                setShowCreate(false);
                reset();
            },
        });
    };

    const submitUpdateApprovers = (e) => {
        e.preventDefault();
        patch(route('admin.approval_categories.update_approvers', editingCategory.id), {
            onSuccess: () => setEditingCategory(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure? This will delete the category and its approval sequences.')) {
            destroy(route('admin.approval_categories.delete', id));
        }
    };

    return (
        <AuthenticatedLayout
            header="Approval Flow Control"
        >
            <Head title="Approval Tables" />

            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Approval Tables</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Configure multi-stage sequential workflows</p>
                    </div>

                    <button 
                        onClick={() => setShowCreate(true)}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center gap-2"
                    >
                        <span className="text-lg leading-none">+</span> NEW CATEGORY
                    </button>
                </div>

                {showCreate && (
                    <div className="card border-2 border-indigo-100 mb-10 bg-indigo-50/30">
                        <form onSubmit={submitCreate} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <InputLabel value="Category Name (e.g. Firmware, IT Software)" />
                                <TextInput 
                                    className="mt-1 block w-full rounded-xl" 
                                    value={data.name} 
                                    onChange={(e) => setData('name', e.target.value)} 
                                    placeholder="Enter category name..."
                                    required 
                                />
                                {errors.name && <div className="text-red-500 text-[10px] mt-1 font-bold">{errors.name}</div>}
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs font-bold text-gray-400">CANCEL</button>
                                <button type="submit" disabled={processing} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-100">CREATE CATEGORY</button>
                            </div>
                        </form>
                    </div>
                )}

                {editingCategory && (
                    <div className="card border-2 border-indigo-100 mb-10 shadow-2xl">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-3">
                                <span className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl">⛓️</span>
                                <h3 className="text-lg font-bold text-gray-800">Sequential Flow: {editingCategory.name}</h3>
                            </div>
                            <button onClick={() => setEditingCategory(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={submitUpdateApprovers} className="space-y-6">
                            <div className="space-y-4">
                                {data.approvers.map((approver, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                                        <div className="h-8 w-8 rounded-full bg-white border-2 border-indigo-600 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <select 
                                                className="w-full rounded-xl border-gray-200 text-sm font-medium"
                                                value={approver.user_id}
                                                onChange={(e) => updateApproverUser(index, e.target.value)}
                                                required
                                            >
                                                <option value="">Select Approver...</option>
                                                {internalUsers.map(u => (
                                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => removeApprover(index)}
                                            className="text-red-400 hover:text-red-600 transition"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}

                                <button 
                                    type="button" 
                                    onClick={addApprover}
                                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold text-xs hover:border-indigo-600 hover:text-indigo-600 transition flex items-center justify-center gap-2"
                                >
                                    <span>+</span> ADD APPROVAL STAGE
                                </button>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button type="button" onClick={() => setEditingCategory(null)} className="px-4 py-2 text-xs font-bold text-gray-400">DISCARD</button>
                                <button type="submit" disabled={processing} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-100 uppercase tracking-widest">Update Approval Order</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map(cat => (
                        <div key={cat.id} className="card hover:shadow-2xl transition-all duration-300 group border border-gray-50 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                    {cat.name.charAt(0)}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                            
                            <h4 className="text-lg font-bold text-gray-800 mb-1">{cat.name}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">
                                {cat.sequences.length} Approval Stages Configured
                            </p>

                            <div className="space-y-3 mb-8 flex-1">
                                {cat.sequences.map((s, i) => (
                                    <div key={s.id} className="flex items-center gap-3">
                                        <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 text-[8px] font-black flex items-center justify-center shrink-0">
                                            {i + 1}
                                        </div>
                                        <div className="text-xs font-medium text-gray-600 truncate">
                                            {s.user.name}
                                        </div>
                                    </div>
                                ))}
                                {cat.sequences.length === 0 && (
                                    <div className="py-4 text-center border-2 border-dashed border-gray-100 rounded-xl">
                                        <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">No Approvers Set</p>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => handleEdit(cat)}
                                className="w-full py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all duration-300"
                            >
                                Edit Approval Table
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
