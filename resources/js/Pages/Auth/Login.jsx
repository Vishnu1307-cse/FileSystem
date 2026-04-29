import { useEffect, useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const [loginMode, setLoginMode] = useState('password'); // 'password' or 'otp'
    const [otpSent, setOtpSent] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        otp: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password', 'otp');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (loginMode === 'password') {
            post(route('login'), {
                onFinish: () => reset('password'),
            });
        } else {
            if (!otpSent) {
                post(route('otp.send'), {
                    onSuccess: () => setOtpSent(true),
                });
            } else {
                post(route('otp.verify'), {
                    onFinish: () => reset('otp'),
                });
            }
        }
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-8 text-center">
                <img src="/image.png" alt="Logo" className="h-10 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800">Secure Access Portal</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Select your authorization method</p>
            </div>

            <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-xl">
                <button 
                    onClick={() => { setLoginMode('password'); setOtpSent(false); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${loginMode === 'password' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    INTERNAL LOGIN
                </button>
                <button 
                    onClick={() => { setLoginMode('otp'); setOtpSent(false); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${loginMode === 'otp' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    PORTAL (OTP)
                </button>
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
                        disabled={otpSent}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {loginMode === 'password' ? (
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
                ) : (
                    otpSent && (
                        <div className="mt-4 animate-fade-in">
                            <InputLabel htmlFor="otp" value="Verification Code (OTP)" />
                            <TextInput
                                id="otp"
                                type="text"
                                name="otp"
                                value={data.otp}
                                className="mt-1 block w-full rounded-xl tracking-[10px] text-center font-bold text-lg"
                                placeholder="000000"
                                onChange={(e) => setData('otp', e.target.value)}
                            />
                            <InputError message={errors.otp} className="mt-2" />
                        <div className="mt-4 flex flex-col gap-3">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Check your inbox for the 6-digit code</p>
                            <button 
                                type="button"
                                onClick={submit}
                                disabled={processing}
                                className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition"
                            >
                                {processing ? 'Requesting...' : "Didn't get the code? Resend"}
                            </button>
                        </div>
                        </div>
                    )
                )}

                {loginMode === 'password' && (
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
                )}

                <div className="mt-8 flex flex-col gap-4">
                    <PrimaryButton className="w-full justify-center py-3 rounded-xl shadow-lg shadow-indigo-100" disabled={processing}>
                        {loginMode === 'password' ? 'ACCESS SYSTEM' : (otpSent ? 'VERIFY & ENTER' : 'REQUEST ACCESS CODE')}
                    </PrimaryButton>

                    {loginMode === 'password' && canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-center text-xs text-gray-400 font-bold hover:text-indigo-600 uppercase tracking-widest transition"
                        >
                            Credential Recovery
                        </Link>
                    )}
                    
                    {otpSent && (
                        <button 
                            type="button"
                            onClick={() => setOtpSent(false)}
                            className="text-center text-xs text-gray-400 font-bold hover:text-indigo-600 uppercase tracking-widest transition"
                        >
                            Change Email Address
                        </button>
                    )}
                </div>
            </form>

            <div className="mt-10 pt-6 border-t border-gray-50 text-center">
                <p className="text-[9px] text-gray-300 font-bold uppercase tracking-[3px]">Secure Environment • Powered by Antigravity</p>
            </div>
        </GuestLayout>
    );
}
