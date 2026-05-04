import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import ComposeMail from '@/Components/Mail/ComposeMail';

export default function Compose({ categories }) {
    return (
        <AuthenticatedLayout
            header="Compose External Approval Mail"
        >
            <Head title="Compose Mail" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <ComposeMail categories={categories} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
