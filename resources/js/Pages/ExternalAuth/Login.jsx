import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Login() {
    const [stage, setStage] = useState(1); // 1: Email, 2: OTP
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOtp = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        window.axios.post('/external/otp-send', { email })
            .then(response => {
                setStage(2);
            })
            .catch(err => {
                setError(err.response?.data?.message || 'Failed to send OTP.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        window.axios.post('/external/otp-verify', { email, otp })
            .then(response => {
                window.location.href = '/external/inbox';
            })
            .catch(err => {
                setError(err.response?.data?.message || 'Invalid OTP.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <GuestLayout>
            <Head title="Customer / Vendor Portal Login" />

            <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-gray-800">Customer / Vendor Portal</h2>
                <p className="text-sm text-gray-500 mt-1">
                    {stage === 1 
                        ? 'Enter your registered email to receive a login code' 
                        : `A 6-digit code was sent to ${email}`
                    }
                </p>
            </div>

            {stage === 1 ? (
                <form onSubmit={handleSendOtp}>
                    <div>
                        <InputLabel htmlFor="email" value="Email Address" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            isFocused={true}
                            required
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {error && <p className="mt-2 text-sm text-red-600 font-bold">{error}</p>}
                    </div>

                    <div className="mt-6">
                        <PrimaryButton className="w-full justify-center" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Code'}
                        </PrimaryButton>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp}>
                    <div>
                        <InputLabel htmlFor="otp" value="Verification Code" />
                        <TextInput
                            id="otp"
                            type="text"
                            name="otp"
                            value={otp}
                            className="mt-1 block w-full text-center text-2xl tracking-widest font-bold"
                            autoComplete="one-time-code"
                            isFocused={true}
                            required
                            maxLength={6}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        {error && <p className="mt-2 text-sm text-red-600 font-bold">{error}</p>}
                    </div>

                    <div className="mt-6 flex flex-col gap-4">
                        <PrimaryButton className="w-full justify-center" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </PrimaryButton>

                        <button
                            type="button"
                            className="text-center text-sm text-gray-600 hover:text-indigo-600 font-bold underline transition"
                            onClick={() => {
                                setStage(1);
                                setError('');
                                setOtp('');
                            }}
                        >
                            Resend Code
                        </button>
                    </div>
                </form>
            )}
        </GuestLayout>
    );
}
