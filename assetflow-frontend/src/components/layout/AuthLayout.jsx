import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-800 selection:bg-teal-500 selection:text-white">
      {/* Light decorative grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />
      
      {/* Decorative gradient blur */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-teal-100 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex justify-center items-center gap-2">
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
            AssetFlow
          </span>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;

