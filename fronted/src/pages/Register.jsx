import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        setSuccess("");

        setLoading(true);


        try {

            await api.post(
                "/auth/register",
                formData
            );


            setSuccess(
                "Account created successfully. Redirecting to login..."
            );


            setTimeout(() => {

                navigate("/");

            }, 1500);

        }
        catch (error) {

            setError(
                error.response?.data?.message ||
                "Unable to create account."
            );

        }
        finally {

            setLoading(false);

        }

    };


    return (

        <div className="
            min-h-screen
            bg-gradient-to-br
            from-slate-950
            via-indigo-950
            to-slate-900
            flex
            items-center
            justify-center
            p-4
        ">


            <div className="w-full max-w-md">


                {/* Logo */}

                <div className="text-center mb-8">

                    <div className="
                        w-16
                        h-16
                        rounded-2xl
                        bg-gradient-to-br
                        from-indigo-500
                        to-purple-500
                        flex
                        items-center
                        justify-center
                        mx-auto
                    ">

                        <span className="
                            text-white
                            text-2xl
                            font-bold
                        ">
                            $
                        </span>

                    </div>


                    <h1 className="
                        text-3xl
                        font-bold
                        text-white
                        mt-5
                    ">
                        Create your account
                    </h1>


                    <p className="
                        text-slate-400
                        mt-2
                    ">
                        Start tracking prices today.
                    </p>

                </div>


                <div className="
                    bg-white
                    rounded-3xl
                    p-7
                    sm:p-9
                    shadow-2xl
                ">


                    {error && (

                        <div className="
                            mb-5
                            p-3
                            rounded-xl
                            bg-red-50
                            border
                            border-red-200
                            text-red-700
                            text-sm
                        ">
                            {error}
                        </div>

                    )}


                    {success && (

                        <div className="
                            mb-5
                            p-3
                            rounded-xl
                            bg-emerald-50
                            border
                            border-emerald-200
                            text-emerald-700
                            text-sm
                        ">
                            {success}
                        </div>

                    )}


                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >


                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-slate-700
                                mb-2
                            ">
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                required
                                className="
                                    w-full
                                    px-4
                                    py-3.5
                                    rounded-xl
                                    border
                                    border-slate-200
                                    outline-none
                                    focus:border-indigo-500
                                    focus:ring-4
                                    focus:ring-indigo-100
                                "
                            />

                        </div>


                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-slate-700
                                mb-2
                            ">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                className="
                                    w-full
                                    px-4
                                    py-3.5
                                    rounded-xl
                                    border
                                    border-slate-200
                                    outline-none
                                    focus:border-indigo-500
                                    focus:ring-4
                                    focus:ring-indigo-100
                                "
                            />

                        </div>


                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-slate-700
                                mb-2
                            ">
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                required
                                minLength={6}
                                className="
                                    w-full
                                    px-4
                                    py-3.5
                                    rounded-xl
                                    border
                                    border-slate-200
                                    outline-none
                                    focus:border-indigo-500
                                    focus:ring-4
                                    focus:ring-indigo-100
                                "
                            />

                        </div>


                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                w-full
                                py-3.5
                                rounded-xl
                                bg-indigo-600
                                hover:bg-indigo-700
                                disabled:bg-indigo-300
                                text-white
                                font-semibold
                                shadow-lg
                                shadow-indigo-200
                            "
                        >

                            {loading
                                ? "Creating account..."
                                : "Create Account"
                            }

                        </button>

                    </form>


                    <div className="
                        text-center
                        mt-7
                        pt-6
                        border-t
                        border-slate-100
                    ">

                        <p className="text-sm text-slate-500">

                            Already have an account?{" "}

                            <Link
                                to="/"
                                className="
                                    font-semibold
                                    text-indigo-600
                                "
                            >
                                Sign in
                            </Link>

                        </p>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default Register;