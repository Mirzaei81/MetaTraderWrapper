'use client';
import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog"
import { cn } from '@/lib/utils'
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getUserFromToken } from '@/lib/jwt';
import Link from 'next/link';
import ReCAPTCHA from 'react-google-recaptcha';

const SignupDialog = ({ isOpen, onclose }: { isOpen: boolean, onclose: any }) => {
  let token = '';
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorUser, setErrorUser] = useState<string | null>(null)
  const [errorEmail, setErrorEmail] = useState<string | null>(null)
  const [errorp1, setErrorp1] = useState<string | null>(null)
  const [errorp2, setErrorp2] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const handleCaptchaChange = (value: any) => {
    if (value) {
      setIsCaptchaVerified(true);
    }
  };

  useEffect(() => {
    const clearErrorsTimeout = setTimeout(() => {
      setErrorUser(null);
      setErrorEmail(null);
      setErrorp1(null);
      setErrorp2(null);
      setError(null);
    }, 5000);

    return () => clearTimeout(clearErrorsTimeout);
  }, [errorUser, errorEmail, errorp1, errorp2, error]);

  const openToast = () => {

    const user: any = getUserFromToken();
    toast("Your account created successfully", {
      description: "check your email for verification link",
      action: {
        label: "Profile",
        onClick: () => {
          <Link href={`/profile?id=${user.id}`}>
            <a>Prof1le</a>
          </Link>;
        }
      },
    })
  }

  const handleClose = () => {
    setOpen(false)
    onclose();
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true)

    const username = (document.getElementById('username') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const password2 = (document.getElementById('password2') as HTMLInputElement).value;

    if (password.length < 8) {
      setErrorp1('password must be 8 or more characters')
      setIsLoading(false)
      return;
    }
    if (password != password2) {
      setErrorp2('passwords do not match')
      setIsLoading(false)
      return;
    }
    // Prepare the data to send
    const data = {
      username: username,
      email: email,
      password: password,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Check if the response is ok (status code 200-299)
      if (response.ok) {
        token = await response.json();
        setErrorUser(null)
        setErrorEmail(null)
        setErrorp1(null)
        setErrorp2(null)
        setOpen(false);
        onclose();
        sessionStorage.setItem('token', token)
        openToast();
      } else {
        const errorData = await response.json();
        sessionStorage.removeItem('token');
        if (errorData.username) {
          setErrorUser(errorData.username)
        } else {
          setErrorUser(null)
        }
        if (errorData.email) {
          setErrorEmail(errorData.email)
        } else {
          setErrorEmail(null)
        }
      }
    } catch (error: any) {
      sessionStorage.removeItem('token');
      setError(error.message)
    } finally {
      setIsLoading(false)
    }

  };

  useEffect(() => {
    if (isOpen) {
      // Additional logic when dialog opens, if needed
    }
  }, [isOpen]);

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={handleClose}>

        <DialogContent className='overflow-hidden w-[90vw] -translate-x-10  sm:max-w-96 px-0 border-0 opacity-100 mt-6 sm:my-0'>
          <div className='absolute h-full w-[400px] -translate-x-2 -inset-2 filter blur-md'>
            <svg viewBox="0 0 202 151" className=' h-[660px] fill-neutral-300 dark:fill-neutral-900 -z-10' xmlns="http://www.w3.org/2000/svg">
              <path d="M38.4065 37.709C35.414 20.01 26.9352 5.58863 1 1V197H201C200.834 184.764 184.042 163.569 162.097 160.291C140.152 157.013 123.693 137.348 120.701 117.682C117.708 98.0167 103.743 83.8763 81.2993 79.6622C61.5496 75.954 42.2857 60.6522 38.4065 37.709Z" />                    </svg>
          </div>

          <DialogHeader className='text-left px-6 sm:px-12 z-10'>
            <DialogTitle className='heading text-2xl font-semibold'>Sign up</DialogTitle>
            <p>welcome to Crypto Punch</p>
          </DialogHeader>

          <div className='flex flex-col justify-center items-center gap-1 w-full h-full'>
            {error && <div className='text-red-500 text-sm z-10 h-5 text-right pb-1 animate-fadeOut'>{error}</div>}
            <form action="/user/create" method="post" className="my-8 w-full px-6 sm:px-12 pt-2" onSubmit={handleSubmit}>
              <LabelInputContainer className='my-2'>
                <label htmlFor="username" className='text-sm text-black dark:text-white font-semibold z-10'>Username</label>
                <CustomInput id="username" type="text" placeholder='username' />
                {errorUser && <div className={`text-red-500 text-sm z-10 h-5 text-right pb-1 animate-fadeOut`}>{errorUser}</div>}
              </LabelInputContainer>

              <LabelInputContainer className='my-2'>
                <label htmlFor="email" className='text-sm text-black dark:text-white font-semibold z-10'>Email</label>
                <CustomInput id="email" type="email" placeholder='Email' />
                {errorEmail && <div className={`text-red-500 text-sm z-10 h-5 text-right pb-1 animate-fadeOut`}>{errorEmail}</div>}
              </LabelInputContainer>

              <LabelInputContainer className='my-1'>
                <label htmlFor="password" className='text-sm text-black dark:text-white font-semibold z-10'>Password</label>
                <CustomInput id="password" type="password" placeholder='••••••••' />
                {errorp1 && <div className={`text-red-500 h-5 text-sm z-10 text-right pb-1 animate-fadeOut`}>{errorp1}</div>}
              </LabelInputContainer>

              <LabelInputContainer className='my-2'>
                <label htmlFor="password2" className='text-sm text-black dark:text-white font-semibold z-10'>Confirm Password</label>
                <CustomInput id="password2" type="password" placeholder='••••••••' />
                {errorp2 && <div className={`text-red-500 h-5 text-sm z-10 text-right pb-1 animate-fadeOut`}>{errorp2}</div>}
              </LabelInputContainer>
              <div className="w-full mb-3 flex justify-center items-center">
                <ReCAPTCHA
                  sitekey={`${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
                  onChange={handleCaptchaChange}
                />
              </div>

              <button
                className="mt-10 bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                type="submit" disabled={isLoading || !isCaptchaVerified}
              >
                {isLoading ? 'Loading...' : 'Sign up  →'}
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SignupDialog

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-1 w-full", className)}>
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