import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

const Icon = ({ path, className = "w-4 h-4" }) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path} />
    </svg>
);

export default function Roles({ roles, permissions }) {
    const [pendingChanges, setPendingChanges] = useState({}); // { roleId: [permissionIds] }
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [savingRoleId, setSavingRoleId] = useState(null);

    const { data: createData, setData: setCreateData, post: postCreate, processing: creating, reset: resetCreate, errors: createErrors } = useForm({
        name: '',
    });

    const handleTogglePermission = (roleId, permissionId) => {
        const role = roles.find(r => r.id === roleId);
        const currentPermissions = pendingChanges[roleId] !== undefined 
            ? pendingChanges[roleId] 
            : role.permissions.map(p => p.id);
        
        const newPermissions = currentPermissions.includes(permissionId)
            ? currentPermissions.filter(id => id !== permissionId)
            : [...currentPermissions, permissionId];

        setPendingChanges({
            ...pendingChanges,
            [roleId]: newPermissions
        });
    };

    const saveChanges = (roleId) => {
        setSavingRoleId(roleId);
        
        router.patch(route('manage.roles.update_permissions', roleId), {
            permissions: pendingChanges[roleId]
        }, {
            preserveScroll: true,
            onSuccess: () => {
                const newPending = { ...pendingChanges };
                delete newPending[roleId];
                setPendingChanges(newPending);
                setSavingRoleId(null);
                setSuccessMessage(`Permissions for ${roles.find(r => r.id === roleId).name} updated successfully!`);
                setTimeout(() => setSuccessMessage(null), 3000);
            },
            onError: (errors) => {
                setSavingRoleId(null);
                console.error('Save failed:', errors);
            }
        });
    };

    const submitCreate = (e) => {
        e.preventDefault();
        postCreate(route('manage.roles.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                resetCreate();
            }
        });
    };

    const confirmDelete = (role) => {
        if (confirm(`Are you sure you want to delete the "${role.name}" role?`)) {
            router.delete(route('manage.roles.delete', role.id));
        }
    };

    return (
        <AuthenticatedLayout header="Role & Permission Management">
            <Head title="Manage Roles" />

            <div className="space-y-6">
                {successMessage && (
                    <div className="fixed top-20 right-8 z-50 animate-in slide-in-from-right-8 fade-in duration-300">
                        <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400">
                            <Icon path="M5 13l4 4L19 7" className="w-6 h-6" />
                            <span className="font-black text-xs uppercase tracking-widest">{successMessage}</span>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">System Roles</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase mt-1">Configure dashboard visibility and feature access</p>
                    </div>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition"
                    >
                        Create New Role
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {roles.map(role => {
                        const hasChanges = pendingChanges[role.id] !== undefined;
                        const currentPermissionIds = hasChanges ? pendingChanges[role.id] : role.permissions.map(p => p.id);
                        const isSaving = savingRoleId === role.id;

                        return (
                            <div key={role.id} className={`card p-0 overflow-hidden border transition-all duration-300 ${hasChanges ? 'border-indigo-400 shadow-indigo-50 ring-4 ring-indigo-50' : 'border-gray-100 shadow-sm'}`}>
                                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-100">
                                            {role.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-gray-800 uppercase tracking-tight">{role.name}</div>
                                            <div className="text-[9px] text-indigo-500 font-bold uppercase tracking-tighter">Slug: {role.slug}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {hasChanges && (
                                            <button 
                                                onClick={() => saveChanges(role.id)}
                                                disabled={isSaving}
                                                className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition flex items-center gap-2 animate-in zoom-in-95"
                                            >
                                                {isSaving ? 'Updating...' : 'Save Confirmation'}
                                                <Icon path="M5 13l4 4L19 7" className="w-3 h-3" />
                                            </button>
                                        )}
                                        {['admin', 'employee', 'hod', 'customer', 'vendor'].includes(role.slug) ? (
                                            <span className="px-3 py-1 bg-white border border-gray-100 text-gray-400 rounded-lg text-[8px] font-black uppercase shadow-sm">System Core</span>
                                        ) : (
                                            <button 
                                                onClick={() => confirmDelete(role)}
                                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        Permissions & Access Control
                                        {hasChanges && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {permissions.map(permission => {
                                            const isSelected = currentPermissionIds.includes(permission.id);
                                            
                                            return (
                                                <button
                                                    key={permission.id}
                                                    onClick={() => handleTogglePermission(role.id, permission.id)}
                                                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all group ${
                                                        isSelected 
                                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' 
                                                        : 'border-gray-50 bg-gray-50/50 text-gray-400 hover:border-gray-200'
                                                    }`}
                                                >
                                                    <div className="text-left">
                                                        <div className="text-[9px] font-black uppercase tracking-tight">{permission.name}</div>
                                                        <div className="text-[7px] font-bold opacity-60 mt-0.5">{permission.slug}</div>
                                                    </div>
                                                    {isSelected ? (
                                                        <Icon path="M5 13l4 4L19 7" className="w-4 h-4" />
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full border-2 border-gray-200 group-hover:border-gray-300" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Create Custom Role</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase mt-1 mb-6">Define a new identity and set its capabilities</p>
                            
                            <form onSubmit={submitCreate} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Role Name</label>
                                    <input 
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-2xl text-sm font-bold focus:ring-indigo-600 focus:border-indigo-600"
                                        placeholder="e.g. Finance Auditor"
                                        value={createData.name}
                                        onChange={e => setCreateData('name', e.target.value)}
                                        required
                                    />
                                    {createErrors.name && <div className="text-red-500 text-[10px] mt-1 font-bold uppercase">{createErrors.name}</div>}
                                </div>

                                <div className="flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-3 px-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition"
                                    >
                                        Create Role
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
