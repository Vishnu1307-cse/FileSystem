import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useState, useEffect } from 'react';

export default function Users({ users, hods, availableRoles, filters }) {
    const [editingUser, setEditingUser] = useState(null);
    const [showCreate, setShowCreate] = useState(new URLSearchParams(window.location.search).get('action') === 'create');
    const [search, setSearch] = useState(filters.search || '');

    const { data, setData, patch, post, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role_id: '',
        hod_id: ''
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('action') === 'create') {
            setShowCreate(true);
        }
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('manage.users', filters.role), { search }, {
            preserveState: true,
            replace: true
        });
    };

    const handleEdit = (user) => {
        setShowCreate(false);
        setEditingUser(user);
        setData({
            role_id: user.role_id,
            hod_id: user.hod_id || ''
        });
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('manage.users.store'), {
            onSuccess: () => {
                setShowCreate(false);
                reset();
                const url = new URL(window.location);
                url.searchParams.delete('action');
                window.history.replaceState({}, '', url);
            },
        });
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        patch(route('manage.users.update_role', editingUser.id), {
            onSuccess: () => setEditingUser(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            destroy(route('manage.users.delete', id));
        }
    };

    const getTitle = () => {
        if (!filters.role) return 'All Identities';
        if (filters.role === 'internal') return 'Internal Employees';
        return filters.role.charAt(0).toUpperCase() + filters.role.slice(1) + 's';
    };

    const selectedRole = availableRoles.find(r => r.id == data.role_id);

    return (
        <AuthenticatedLayout
            header={`${getTitle()} Control`}
        >
            <Head title="User Management" />

            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{getTitle()}</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Management and access control</p>
                    </div>

                    <form onSubmit={handleSearch} className="w-full md:w-96 flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </span>
                            <input 
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-100 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                                placeholder={`Search ${getTitle().toLowerCase()}...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">FIND</button>
                        <button 
                            type="button" 
                            onClick={() => setShowCreate(true)}
                            className="px-4 py-2 bg-[#51bb25] text-white rounded-xl font-bold text-xs hover:bg-[#45a020] transition shadow-lg shadow-[#51bb2520] whitespace-nowrap"
                        >
                            + ADD USER
                        </button>
                    </form>
                </div>

                {showCreate && (
                    <div className="card border-2 border-[#51bb2520] mb-10 bg-[#51bb2505]">
                        <div className="flex items-center gap-3 mb-6 border-b border-[#51bb2510] pb-4">
                            <span className="h-10 w-10 rounded-xl bg-[#51bb25] text-white flex items-center justify-center text-xl">✨</span>
                            <h3 className="text-lg font-bold text-gray-800">Provision New Identity</h3>
                        </div>
                        <form onSubmit={submitCreate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <InputLabel value="Full Name" />
                                    <TextInput className="mt-1 block w-full rounded-xl" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                    {errors.name && <div className="text-red-500 text-[10px] mt-1 font-bold">{errors.name}</div>}
                                </div>
                                <div>
                                    <InputLabel value="Email Address" />
                                    <TextInput type="email" className="mt-1 block w-full rounded-xl" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                                    {errors.email && <div className="text-red-500 text-[10px] mt-1 font-bold">{errors.email}</div>}
                                </div>
                                <div>
                                    <InputLabel value="Login Password" />
                                    <TextInput type="password" className="mt-1 block w-full rounded-xl" value={data.password} onChange={(e) => setData('password', e.target.value)} required />
                                    {errors.password && <div className="text-red-500 text-[10px] mt-1 font-bold">{errors.password}</div>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                                <div>
                                    <InputLabel value="System Role" />
                                    <select 
                                        className="mt-1 block w-full rounded-xl border-gray-200" 
                                        value={data.role_id} 
                                        onChange={(e) => setData('role_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Select a role...</option>
                                        {availableRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                                {selectedRole?.slug === 'employee' && (
                                    <div>
                                        <InputLabel value="Reporting HOD" />
                                        <select className="mt-1 block w-full rounded-xl border-gray-200" value={data.hod_id} onChange={(e) => setData('hod_id', e.target.value)}>
                                            <option value="">No Reporting Authority</option>
                                            {hods.map(h => (<option key={h.id} value={h.id}>{h.name} ({h.email})</option>))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreate(false)} className="text-sm font-bold text-gray-400 hover:text-gray-600">DISCARD</button>
                                <button type="submit" disabled={processing} className="btn-primary bg-[#51bb25] shadow-[#51bb2520]">AUTHORIZE ACCESS</button>
                            </div>
                        </form>
                    </div>
                )}

                {editingUser && (
                    <div className="card border-2 border-[#7366ff20] mb-10 bg-[#7366ff05]">
                        <div className="flex items-center gap-3 mb-6 border-b border-[#7366ff10] pb-4">
                            <span className="h-10 w-10 rounded-xl bg-[#7366ff] text-white flex items-center justify-center text-xl">🛠️</span>
                            <h3 className="text-lg font-bold text-gray-800">Modify Privileges: {editingUser.email}</h3>
                        </div>
                        <form onSubmit={submitUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel value="System Role" />
                                    <select 
                                        className="mt-1 block w-full rounded-xl border-gray-200" 
                                        value={data.role_id} 
                                        onChange={(e) => setData('role_id', e.target.value)}
                                        required
                                    >
                                        {availableRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                                {selectedRole?.slug === 'employee' && (
                                    <div>
                                        <InputLabel value="Reporting HOD" />
                                        <select className="mt-1 block w-full rounded-xl border-gray-200" value={data.hod_id} onChange={(e) => setData('hod_id', e.target.value)}>
                                            <option value="">No Reporting Authority</option>
                                            {hods.map(h => (<option key={h.id} value={h.id}>{h.name} ({h.email})</option>))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setEditingUser(null)} className="text-sm font-bold text-gray-400 hover:text-gray-600">CANCEL</button>
                                <button type="submit" disabled={processing} className="btn-primary">UPDATE PERMISSIONS</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="card p-0 overflow-hidden shadow-xl border border-gray-50">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">System User</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-[#7366ff05] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs group-hover:bg-[#7366ff20] group-hover:text-[#7366ff] transition">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-800">{u.name}</div>
                                                <div className="text-[10px] text-gray-400 font-medium">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter ${
                                            u.role?.slug === 'admin' ? 'bg-[#fd2e6410] text-[#fd2e64]' : 
                                            u.role?.slug === 'hod' ? 'bg-indigo-600 text-white' :
                                            u.role?.slug === 'employee' ? 'bg-[#7366ff10] text-[#7366ff]' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {u.role?.name || 'No Role'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-4">
                                        <button onClick={() => handleEdit(u)} className="text-[10px] font-bold text-[#7366ff] hover:underline uppercase tracking-widest">Edit</button>
                                        <button onClick={() => handleDelete(u.id)} className="text-[10px] font-bold text-[#fd2e64] hover:underline uppercase tracking-widest">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-20 text-center">
                                        <div className="text-4xl mb-4 opacity-10">🔍</div>
                                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">No matching identities found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
