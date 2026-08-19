import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");


    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        setLoading(true);


        try {

            const response = await api.post(
                "/auth/login",
                formData
            );


            const token =
                response.data.token ||
                response.data.accessToken;


            if (!token) {

                setError("Login successful but token was not received.");

                return;

            }


            localStorage.setItem("token", token);

            navigate("/dashboard");

        }
        catch (error) {

            setError(
                error.response?.data?.message ||
                "Invalid email or password."
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


            {/* Background decoration */}

            <div className="
                fixed
                top-0
                left-0
                w-72
                h-72
                bg-indigo-600/20
                rounded-full
                blur-3xl
            " />


            <div className="
                fixed
                bottom-0
                right-0
                w-96
                h-96
                bg-purple-600/20
                rounded-full
                blur-3xl
            " />


            <div className="
                relative
                w-full
                max-w-md
            ">


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
                        shadow-2xl
                        shadow-indigo-500/30
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
                        Price<span className="text-indigo-400">
                            Alert
                        </span>
                    </h1>


                    <p className="
                        text-slate-400
                        mt-2
                    ">
                        Smart price tracking made simple
                    </p>

                </div>


                {/* Card */}

                <div className="
                    bg-white
                    rounded-3xl
                    p-7
                    sm:p-9
                    shadow-2xl
                ">

                    <h2 className="
                        text-2xl
                        font-bold
                        text-slate-900
                    ">
                        Welcome back 👋
                    </h2>


                    <p className="
                        text-slate-500
                        mt-2
                        text-sm
                    ">
                        Sign in to continue monitoring your products.
                    </p>


                    {error && (

                        <div className="
                            mt-5
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


                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 space-y-5"
                    >


                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-slate-700
                                mb-2
                            ">
                                Email address
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
                                    transition
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
                                placeholder="Enter your password"
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
                                    transition
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
                                transition
                            "
                        >

                            {loading
                                ? "Signing in..."
                                : "Sign In"
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

                            Don't have an account?{" "}

                            <Link
                                to="/register"
                                className="
                                    font-semibold
                                    text-indigo-600
                                    hover:text-indigo-700
                                "
                            >
                                Create account
                            </Link>

                        </p>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default Login;