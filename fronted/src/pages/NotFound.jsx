import { Link } from "react-router-dom";

function NotFound() {

    return (

        <div className="
            min-h-screen
            bg-slate-50
            flex
            items-center
            justify-center
            px-4
        ">

            <div className="text-center">

                <div className="
                    text-8xl
                    font-black
                    text-indigo-600
                ">
                    404
                </div>


                <h1 className="
                    text-3xl
                    font-bold
                    text-slate-900
                    mt-4
                ">
                    Page not found
                </h1>


                <p className="
                    text-slate-500
                    mt-3
                    max-w-md
                ">
                    The page you're looking for doesn't exist or
                    may have been moved.
                </p>


                <Link
                    to="/"
                    className="
                        inline-block
                        mt-7
                        px-6
                        py-3
                        rounded-xl
                        bg-indigo-600
                        text-white
                        font-semibold
                        hover:bg-indigo-700
                    "
                >
                    Go to Login
                </Link>

            </div>

        </div>

    );
}

export default NotFound;