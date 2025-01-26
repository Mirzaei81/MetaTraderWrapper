"use client";
import React, { Dispatch, ReactNode, useEffect, useState } from "react";
import { Label } from "@/components/aceternity/label";
import { Input } from "@/components/aceternity/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { getUserFromToken } from "@/lib/jwt";
import { useAppContext } from "@/context";
import ReCAPTCHA from 'react-google-recaptcha';

export function LoginFormDemo(
  {dict, lang}:
  {dict:any; lang:string}
) {
    let token = '';
    const { user, setUser } = useAppContext();
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [captcha, setCaptcha] = useState(true)

    const [error, setError] = useState<string | null>(null)
    const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

    const handleCaptchaChange = (value:any) => {
        if (value) {
          setIsCaptchaVerified(true);
        }
      };

    useEffect(() => {
        const clearErrorsTimeout = setTimeout(() => {
            setError(null);
            }, 5000);
  
            return () => clearTimeout(clearErrorsTimeout);
        }, [error]);
      
    const openToast = () => {
      
      const user:any = getUserFromToken();
      toast("Login successful", {
        action: {
          label: "Main page",
          onClick: () => {
            <Link href={`/${lang}/user`}>
              {dict.start}
            </Link>;
          }
        },
      })
    }
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(!captcha){
          setError(dict.login.errors.captcha)
          return
        }

        setIsLoading(true)

        const phone_number= (document.getElementById('phone') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        
        // Prepare the data to send
        const data = {
            phone_number: phone_number,
            password: password,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            // Check if the response is ok (status code 200-299)
            if (response.ok) {
                setUser(response);
                token = await response.json();
                setError(null)
                sessionStorage.setItem('token', token)
                openToast();
            } else {
                const errorData = await response.json();
                sessionStorage.removeItem('token');
                if (errorData.error) {
                  setError(errorData.error)
                } else{
                    setError(null)
                }
            }
        } catch (error:any) {
          sessionStorage.removeItem('token');
          setError(error.error)
        } finally {
          setIsLoading(false)
        }
    };
  return (
    <div >
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        {dict.login.title}
      </h2>
      
      <form className="mt-8 mb-2" onSubmit={handleSubmit}>
    
        <LabelInputContainer className="mb-4">
          <Label htmlFor="phone">{dict.signup.phone}</Label>
          <Input id="phone" type="tel" placeholder={dict.signup.phone_placeholder} required/>
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">{dict.signup.password}</Label>
          <Input id="password" placeholder="••••••••" type="password" required/>
        </LabelInputContainer>
        
        <div className="w-full mb-3 flex justify-center items-center">
        <ReCAPTCHA
          sitekey={`${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} 
          onChange={handleCaptchaChange}
        />
        </div>

        {error && <div className='text-red-500 text-sm z-10 h-5 text-right pb-1 animate-fadeOut'>{error}</div>}
        
        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit" 
          disabled={isLoading || !isCaptchaVerified}
        >
          {isLoading ? `${dict.signup.loading}...` : `${dict.login.btn}`}
          <BottomGradient />
        </button>

      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
