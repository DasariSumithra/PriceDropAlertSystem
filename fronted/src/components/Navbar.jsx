import { Link, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const handleLogout = () => {

        localStorage.removeItem("token");

        navigate("/", { replace: true });

    };

    return (

        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="h-20 flex items-center justify-between">

                    {/* Logo */}

                    <Link
                        to="/dashboard"
                        className="flex items-center gap-3"
                    >

                        <div className="
                            w-11
                            h-11
                            rounded-xl
                            bg-gradient-to-br
                            from-indigo-600
                            to-blue-500
                            flex
                            items-center
                            justify-center
                            shadow-lg
                            shadow-indigo-200
                        ">

                            <span className="text-white text-xl font-bold">
                                $
                            </span>

                        </div>


                        <div className="hidden sm:block">

                            <h1 className="font-bold text-xl text-slate-900">
                                Price<span className="text-indigo-600">Alert</span>
                            </h1>

                            <p className="text-xs text-slate-500">
                                Smart price tracking
                            </p>

                        </div>

                    </Link>


                    {/* Navigation */}

                    <nav className="flex items-center gap-2 sm:gap-4">

                        <Link
                            to="/dashboard"
                            className="
                                px-3
                                py-2
                                rounded-lg
                                text-sm
                                font-medium
                                text-slate-600
                                hover:text-indigo-600
                                hover:bg-indigo-50
                                transition
                            "
                        >
                            Dashboard
                        </Link>


                        <Link
                            to="/add-product"
                            className="
                                px-4
                                py-2.5
                                rounded-xl
                                bg-indigo-600
                                text-white
                                text-sm
                                font-semibold
                                shadow-md
                                shadow-indigo-200
                                hover:bg-indigo-700
                                transition
                            "
                        >
                            <span className="hidden sm:inline">
                                + Add Product
                            </span>

                            <span className="sm:hidden">
                                +
                            </span>

                        </Link>


                        <button
                            onClick={handleLogout}
                            className="
                                px-3
                                py-2
                                rounded-lg
                                text-sm
                                font-medium
                                text-slate-500
                                hover:text-red-600
                                hover:bg-red-50
                                transition
                            "
                        >
                            Logout
                        </button>

                    </nav>

                </div>

            </div>

        </header>

    );
}

export default Navbar;