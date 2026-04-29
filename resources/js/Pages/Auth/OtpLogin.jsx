import { useEffect, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function OtpLogin({ email: initialEmail, status }) {
    const [step, setStep] = useState(initialEmail ? 2 : 1);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: initialEmail || '',
        otp: '',
    });

    useEffect(() => {
        if (status === 'OTP sent to your email.') {
            setStep(2);
        }
    }, [status]);

    const submitEmail = (e) => {
        e.preventDefault();
        post(route('otp.send'), {
            onSuccess: () => setStep(2),
        });
    };

    const submitOtp = (e) => {
        e.preventDefault();
        post(route('otp.verify'));
    };

    return (
        <GuestLayout>
            <Head title="Secure Login" />

            <div className="mb-4 text-sm text-gray-600">
                {step === 1 
                    ? 'Enter your registered email address to receive a secure One-Time Password (OTP).'
                    : `We've sent a 6-digit code to ${data.email}. Please enter it below to proceed.`
                }
            </div>

            {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

            {step === 1 ? (
                <form onSubmit={submitEmail}>
                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-end mt-4">
                        <PrimaryButton className="ms-4" disabled={processing}>
                            Send OTP
                        </PrimaryButton>
                    </div>
                </form>
            ) : (
                <form onSubmit={submitOtp}>
                    <div>
                        <InputLabel htmlFor="otp" value="Enter 6-Digit Code" />
                        <TextInput
                            id="otp"
                            type="text"
                            name="otp"
                            value={data.otp}
                            className="mt-1 block w-full text-center text-2xl tracking-widest font-bold"
                            isFocused={true}
                            onChange={(e) => setData('otp', e.target.value)}
                            maxLength="6"
                        />
                        <InputError message={errors.otp} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <button
                            type="button"
                            className="text-sm text-gray-600 hover:text-gray-900 underline"
                            onClick={() => setStep(1)}
                        >
                            Change Email
                        </button>

                        <div className="flex items-center">
                            <button
                                type="button"
                                className="text-sm text-gray-600 hover:text-gray-900 underline mr-4"
                                onClick={submitEmail}
                                disabled={processing}
                            >
                                Resend OTP
                            </button>
                            <PrimaryButton disabled={processing}>
                                Login
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            )}
        </GuestLayout>
    );
}
