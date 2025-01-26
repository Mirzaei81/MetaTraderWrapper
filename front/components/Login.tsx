'use client';
import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog"
import { cn } from '@/lib/utils';
import { getUserFromToken } from '@/lib/jwt';
import { toast } from 'sonner';
import ReCAPTCHA from 'react-google-recaptcha';

const LoginDialog = ({ isOpen, onclose }: { isOpen: boolean, onclose: any }) => {
  let token = '';
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false)
    onclose();
  }

  const openToast = () => {
    const user = getUserFromToken();
    toast("Welcome Back")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true)

    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    const data = {
      username: username,
      password: password,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Check if the response is ok (status code 200-299)
      if (response.ok) {
        token = await response.json();
        sessionStorage.setItem('token', token)
        setError(null)
        setOpen(false);
        onclose();
        openToast();
      } else {
        const errorData = await response.json();

        if (errorData.error) {
          setError("something went wrong please try again later")
        } else {
          setError(null)
        }
        sessionStorage.removeItem('token');
      }

    } catch (error: any) {
      sessionStorage.removeItem('token');
      setError(error)
    } finally {
      setIsLoading(false)
    }
  };

  const handleCaptchaChange = (value:any) => {
    if (value) {
      setIsCaptchaVerified(true);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Additional logic when dialog opens, if needed
    }
    const clearErrorsTimeout = setTimeout(() => {
      setError(null);
    }, 5000);

    return () => clearTimeout(clearErrorsTimeout);
  }, [isOpen, error]);

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className=" overflow-hidden w-[90vw] -translate-x-10  sm:max-w-96 px-0 border-0 opacity-100">
          <div className='absolute h-full w-[400px] -translate-x-2 -inset-2 filter blur-md'>
            <svg viewBox="0 0 202 151" className=' h-[460px] fill-neutral-300 dark:fill-neutral-900 -z-10' xmlns="http://www.w3.org/2000/svg">
              <path d="M38.4065 37.709C35.414 20.01 26.9352 5.58863 1 1V197H201C200.834 184.764 184.042 163.569 162.097 160.291C140.152 157.013 123.693 137.348 120.701 117.682C117.708 98.0167 103.743 83.8763 81.2993 79.6622C61.5496 75.954 42.2857 60.6522 38.4065 37.709Z" />                    </svg>
          </div>

          <DialogHeader className='text-left px-6 sm:px-12 z-10'>
            <DialogTitle className='heading text-2xl font-semibold'>Log in</DialogTitle>
            <p className=''>welcome back !</p>
          </DialogHeader>

          <div className='flex flex-col justify-center items-center gap-1 w-full h-full'>
            <form action="/user/login" method="post" className="my-8 w-full px-6 sm:px-12 pt-2" onSubmit={handleSubmit}>
              {error && <div className={`text-red-500 text-sm z-10 h-5 text-left pb-1 animate-fadeOut`}>{error}</div>}
              <LabelInputContainer className='my-2'>
                <label htmlFor="username" className='text-sm text-black dark:text-white font-semibold z-10'>username / Email</label>
                <CustomInput id="username" type="text" />
              </LabelInputContainer>
              <LabelInputContainer className='my-2'>
                <label htmlFor="password" className='text-sm text-black dark:text-white font-semibold z-10'>Password</label>
                <CustomInput id="password" type="password" placeholder='••••••••' />
              </LabelInputContainer>
              <div className="w-full mb-3 flex justify-center items-center">
                <ReCAPTCHA
                  sitekey={`${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
                  onChange={handleCaptchaChange}
                />
              </div>

              <button
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900
                             dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white
                              rounded-md h-10 mt-10
                              font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] 
                              dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                type="submit" disabled={isLoading || !isCaptchaVerified}
              >
                {isLoading ? 'Loading...' : 'Log in  →'}
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LoginDialog


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

const CustomInput = ({
  id,
  type,
  placeholder,
  className
}: {
  id?: string;
  type?: string;
  placeholder?: string;
  className?: string;
}) => {
  return (
    <input className={cn("border border-neutral-400 dark:border-neutral-950 bg-neutral-100 dark:bg-neutral-800 rounded-md p-1 pl-3 z-10", className)}
      id={id} type={type} placeholder={placeholder}
      required />
  );
};