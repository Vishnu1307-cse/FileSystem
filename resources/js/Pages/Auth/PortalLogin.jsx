import { useEffect, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function PortalLogin({ status }) {
    const [otpSent, setOtpSent] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        otp: '',
    });

    useEffect(() => {
        return () => {
            reset('otp');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (!otpSent) {
            post(route('otp.send'), {
                onSuccess: () => setOtpSent(true),
            });
        } else {
            post(route('otp.verify'), {
                onFinish: () => reset('otp'),
            });
        }
    };

    return (
        <GuestLayout>
            <Head title="External Portal Access" />

            <div className="mb-10 text-center">
                <img src="/image.png" alt="Logo" className="h-12 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">External Portal Access</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2 px-6">Secure identity verification for customers & vendors</p>
            </div>

            {status && (
                <div className="mb-6 text-sm font-bold text-green-600 bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
                    <span className="text-green-500 text-lg">✓</span>
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="email" value="Authorized Email Address" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-xl shadow-sm border-gray-100"
                        autoComplete="username"
                        isFocused={true}
                        disabled={otpSent}
                        placeholder="your@company.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {otpSent && (
                    <div className="animate-fade-in">
                        <InputLabel htmlFor="otp" value="Verification Code (OTP)" />
                        <TextInput
                            id="otp"
                            type="text"
                            name="otp"
                            value={data.otp}
                            className="mt-1 block w-full rounded-xl tracking-[12px] text-center font-bold text-2xl border-indigo-100 bg-indigo-50/30"
                            placeholder="000000"
                            onChange={(e) => setData('otp', e.target.value)}
                        />
                        <InputError message={errors.otp} className="mt-2" />
                        <div className="mt-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sent to {data.email}</p>
                                <button 
                                    type="button"
                                    onClick={() => setOtpSent(false)}
                                    className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest hover:underline"
                                >
                                    Change Email
                                </button>
                            </div>
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
                )}

                <div className="pt-4">
                    <PrimaryButton className="w-full justify-center py-4 rounded-xl shadow-xl shadow-indigo-100 text-sm tracking-widest" disabled={processing}>
                        {otpSent ? 'VERIFY & ACCESS PORTAL' : 'REQUEST PORTAL ACCESS CODE'}
                    </PrimaryButton>
                </div>
            </form>

            <div className="mt-12 pt-8 border-t border-gray-50 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="h-1 w-1 bg-gray-200 rounded-full"></div>
                    <div className="h-1 w-8 bg-indigo-600 rounded-full"></div>
                    <div className="h-1 w-1 bg-gray-200 rounded-full"></div>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[4px]">Verified Security • Powered by Antigravity</p>
            </div>
        </GuestLayout>
    );
}
