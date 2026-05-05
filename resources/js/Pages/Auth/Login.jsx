import { useEffect, useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-8 text-center">
                <img src="/image.png" alt="Logo" className="h-10 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800">Secure Access Portal</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Enter your credentials to continue</p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-bold text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Identity (Email)" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-xl"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="System Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-xl"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-sm text-gray-600 font-medium">Keep me logged in</span>
                    </label>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                    <PrimaryButton className="w-full justify-center py-3 rounded-xl shadow-lg shadow-indigo-100" disabled={processing}>
                        ACCESS SYSTEM
                    </PrimaryButton>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-center text-xs text-gray-400 font-bold hover:text-indigo-600 uppercase tracking-widest transition"
                        >
                            Credential Recovery
                        </Link>
                    )}
                </div>
            </form>

            <div className="mt-10 pt-6 border-t border-gray-50 text-center">
                <p className="text-[9px] text-gray-300 font-bold uppercase tracking-[3px]">Secure Environment • Powered by Antigravity</p>
            </div>
        </GuestLayout>
    );
}
