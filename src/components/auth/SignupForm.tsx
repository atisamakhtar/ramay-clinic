// src/pages/SignupForm.tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabse';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export default function SignupForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

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

                <label className="block mb-2 text-sm font-medium">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 mb-4 border rounded"
                />

                <label className="block mb-2 text-sm font-medium">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 mb-6 border rounded"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 primary-bg-color text-white py-2 rounded hover:bg-blue-700"
                >
                    {loading ? 'Signing up...' : 'Sign Up'}
                </button>

                <Link to='/login' >
                    <Button className='w-full mt-5' >
                        Log in
                    </Button>
                </Link>

                {message && (
                    <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
                )}
            </form>
        </div>
    );
}