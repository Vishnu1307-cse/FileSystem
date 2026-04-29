import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';

export default function Upload({ tickets }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
    });

    const submit = (e, ticketId) => {
        e.preventDefault();
        post(route('tickets.submit_upload', ticketId), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">File Upload (Active Tickets)</h2>}
        >
            <Head title="Ticket Upload" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {tickets.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 text-center text-gray-500">
                            No active tickets requiring file upload at this time.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {tickets.map((ticket) => (
                                <div key={ticket.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-indigo-500">
                                    <div className="flex flex-col md:flex-row justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Ticket #{ticket.id}</h3>
                                            <p className="text-sm text-gray-600">Requested by: <strong>{ticket.sender.name}</strong></p>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Requested on: {new Date(ticket.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="mb-4 p-4 bg-gray-50 rounded italic text-gray-700">
                                        "{ticket.message}"
                                    </div>

                                    <form onSubmit={(e) => submit(e, ticket.id)} className="mt-4 border-t pt-4">
                                        <div className="flex flex-col md:flex-row items-end gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Select File to Upload (Max 20MB)</label>
                                                <input
                                                    type="file"
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                    onChange={(e) => setData('file', e.target.files[0])}
                                                    required
                                                />
                                                <InputError message={errors.file} className="mt-2" />
                                            </div>
                                            <PrimaryButton disabled={processing}>
                                                Upload & Close Ticket
                                            </PrimaryButton>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-2 italic">Important: You can only upload a file once. This will permanently close the ticket.</p>
                                    </form>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
