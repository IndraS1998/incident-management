'use client';
import { useState } from 'react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EAF6FF] p-4">
      <div className="w-full max-w-md bg-[#EAF6FF] rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-[#14213d]">
            {isLogin ? "Admin Login" : "Create Account"}
          </h2>
          <p className="text-[#8d99ae] mt-2">
            {isLogin 
              ? "Access your incident reporting dashboard" 
              : "Set up your admin account"}
          </p>
        </div>
        
        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-[#14213d]">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400]"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-[#14213d]">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400]"
            />
          </div>
          
          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#14213d]">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400]"
              />
            </div>
          )}
          
          {isLogin && (
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="rounded border-gray-300 text-[#FFA400] focus:ring-[#FFA400]" 
                />
                <label htmlFor="remember" className="text-sm text-[#8d99ae]">
                  Remember me
                </label>
              </div>
              <button className="text-sm text-[#FFA400] hover:underline cursor-pointer">
                Forgot password?
              </button>
            </div>
          )}
        </div>
        
        <div className="px-6 pb-6 space-y-4">
          <button className="cursor-pointer w-full py-2 px-4 bg-[#FFA400] hover:bg-[#e69500] text-white font-medium rounded-md transition duration-200">
            {isLogin ? "Sign In" : "Create Account"}
          </button>
          
          <div className="text-center text-sm text-[#8d99ae]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              className="text-[#FFA400] hover:underline ml-1 cursor-pointer" 
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}