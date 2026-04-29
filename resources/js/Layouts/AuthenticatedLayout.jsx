import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import Can from '@/Components/Can';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const { url } = usePage();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(url.includes('/admin/users'));

    useEffect(() => {
        if (url.includes('/admin/users')) {
            setIsUserMenuOpen(true);
        }
    }, [url]);

    const dashboardRoute = route().has('admin.dashboard') && user?.role === 'admin' ? route('admin.dashboard') : 
                           (route().has('employee.dashboard') && ['employee', 'hod'].includes(user?.role) ? route('employee.dashboard') : 
                           (route().has('external.dashboard') ? route('external.dashboard') : '#'));

    const Icon = ({ path }) => (
        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path} />
        </svg>
    );

    return (
        <div className="min-h-screen bg-[#f8f9fe]">
            {/* Sidebar */}
            <aside className={`cuba-sidebar transition-all duration-300 ${isSidebarOpen ? 'w-[240px]' : 'w-0 -translate-x-full'} overflow-hidden`}>
                <div className="w-[240px] p-6 flex flex-col h-full">
                    <div className="mb-8 flex items-center justify-center">
                        <Link href="/">
                            <img src="/image.png" alt="Logo" className="h-8 w-auto" />
                        </Link>
                    </div>

                    <nav className="flex-1 space-y-1">
                        <div className="text-[10px] font-bold text-gray-400 uppercase px-4 mb-2 tracking-widest opacity-70">Main Menu</div>
                        
                        <Can permission="dashboard.view">
                            <Link href={dashboardRoute} className={`nav-item ${route().current('*.dashboard') ? 'active' : ''}`}>
                                <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> Dashboard
                            </Link>
                        </Can>

                        <Can permission="inbox.view">
                            <Link href={route('inbox.index')} className={`nav-item ${route().current('inbox.*') ? 'active' : ''}`}>
                                <Icon path="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /> My Inbox
                            </Link>
                        </Can>

                        <Can permission="admin.users">
                            <div className="text-[10px] font-bold text-gray-400 uppercase px-4 mt-6 mb-2 tracking-widest opacity-70">Administration</div>
                            
                            <div>
                                <button 
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className={`nav-item w-full justify-between ${route().current('admin.users') ? 'active' : ''}`}
                                >
                                    <div className="flex items-center">
                                        <Icon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> 
                                        <span>User Management</span>
                                    </div>
                                    <svg className={`w-3 h-3 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                
                                <div className={`pl-8 space-y-1 mt-1 transition-all duration-300 overflow-hidden ${isUserMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <Link href={route('admin.users', 'internal')} className={`nav-item text-xs py-2 ${usePage().url.includes('/users/internal') ? 'active' : ''}`}>Internal Users</Link>
                                    <Link href={route('admin.users', 'customer')} className={`nav-item text-xs py-2 ${usePage().url.includes('/users/customer') ? 'active' : ''}`}>Customers</Link>
                                    <Link href={route('admin.users', 'vendor')} className={`nav-item text-xs py-2 ${usePage().url.includes('/users/vendor') ? 'active' : ''}`}>Vendors</Link>
                                </div>
                            </div>
                        </Can>

                        <Can permission="admin.transfers">
                            <Link href={route('admin.transfers')} className={`nav-item ${route().current('admin.transfers') ? 'active' : ''}`}>
                                <Icon path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" /> Global Flows
                            </Link>
                        </Can>

                        <Can permission="admin.roles">
                            <Link href={route('admin.roles')} className={`nav-item ${route().current('admin.roles') ? 'active' : ''}`}>
                                <Icon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> Role Management
                            </Link>
                        </Can>

                        <Can permission="admin.approval_categories">
                            <Link href={route('admin.approval_categories')} className={`nav-item ${route().current('admin.approval_categories') ? 'active' : ''}`}>
                                <Icon path="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /> Approval Table
                            </Link>
                        </Can>

                        <Can permission="transfers.compose">
                            <div className="text-[10px] font-bold text-gray-400 uppercase px-4 mt-6 mb-2 tracking-widest opacity-70">File Services</div>
                            <Link href={route('transfers.compose')} className={`nav-item ${route().current('transfers.compose') ? 'active' : ''}`}>
                                <Icon path="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /> Compose Transfer
                            </Link>
                        </Can>
                        
                        <Can permission="approvals.view">
                            <Link href={route('transfers.approvals')} className={`nav-item ${route().current('transfers.approvals') ? 'active' : ''}`}>
                                <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> Approvals
                            </Link>
                        </Can>

                        <Can permission="tickets.upload">
                            <div className="text-[10px] font-bold text-gray-400 uppercase px-4 mt-6 mb-2 tracking-widest opacity-70">Portal</div>
                            <Link href={route('tickets.upload')} className={`nav-item ${route().current('tickets.upload') ? 'active' : ''}`}>
                                <Icon path="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /> Upload Response
                            </Link>
                        </Can>
                    </nav>

                    <div className="mt-auto border-t border-gray-50 pt-4">
                        <Link method="post" href={route('logout')} as="button" className="nav-item w-full text-red-500 hover:bg-red-50 flex items-center group">
                            <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /> 
                            <span className="font-bold">Logout</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`transition-all duration-300 ${isSidebarOpen ? 'pl-[240px]' : 'pl-0'}`}>
                {/* Header */}
                <header className="cuba-header justify-between border-b border-gray-50">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-50 rounded-xl transition text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                        </button>
                        {header && <div className="ml-2 font-extrabold text-lg text-gray-800 tracking-tight">{header}</div>}
                    </div>

                    <div className="flex items-center gap-4">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white hover:shadow-sm transition border border-transparent">
                                    <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100 text-xs">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <div className="font-bold text-xs text-gray-800 leading-tight">{user.name}</div>
                                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{user.role_name || user.role}</div>
                                    </div>
                                    <svg className="ml-1 h-3 w-3 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>My Settings</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button" className="text-red-600 font-bold">Logout System</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Content */}
                <main className="p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
