// src/pages/SignupForm.tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export default function SignupForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState<boolean>(false)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage('Check your email for confirmation!');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <form
                onSubmit={handleSignup}
                className="bg-white p-8 rounded shadow-md w-full max-w-md"
            >
                <div className="mx-auto h-16 w-16 mb-4 rounded-full flex items-center justify-center">
                    {/* <Package className="h-8 w-8 text-white" /> */}
                    <img src="/media/ramay-clinic.jpg" ></img>
                </div>
                <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

                <div className='space-y-4' >

                    <Input
                        type="email"
                        label="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 mb-4 border rounded"
                    />

                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            label="Password"
                            autoComplete="current-password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-2 mb-6 border rounded"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-[34px] text-gray-500 text-sm"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                </div>

                <div className="flex gap-4 mt-4">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-1/2 bg-blue-600 primary-bg-color text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </Button>

                    <Link to="/login" className="w-1/2">
                        <Button className="w-full">Log in</Button>
                    </Link>
                </div>

                {message && (
                    <p
                        className={`mt-4 text-center text-sm ${message.toLowerCase().includes('success')
                            ? 'text-green-600'
                            : 'text-red-600'
                            }`}
                    >
                        {message}
                    </p>)}

            </form>
        </div>
    );
}