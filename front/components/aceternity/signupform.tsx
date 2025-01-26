"use client";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/aceternity/label";
import { Input } from "@/components/aceternity/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { getUserFromToken } from "@/lib/jwt";
import GetCode from "@/components/aceternity/GetCode";
import { useAppContext } from "@/context";
import { Checkbox } from "../shadcn/checkbox";
import { IoNavigate } from "react-icons/io5";
import { PiNavigationArrowFill } from "react-icons/pi";
import { Dialog,DialogContent } from "../shadcn/dialog";
import "./captcha.css";
import ReCAPTCHA from 'react-google-recaptcha';

export function SignupFormDemo(
  {dict, lang}:
  {dict:any; lang:string}
) {
    let token = '';
    const { user, setUser } = useAppContext();
    const [isLoading2, setIsLoading2] = useState<boolean>(false)
    const [captcha, setCaptcha] = useState(true)
    const [isChecked, setIsChecked] = useState(false)
    const [errorUser2, setErrorUser2] = useState<string | null>(null)
    const [errorreal_name, setErrorReal_name] = useState<string | null>(null)
    const [errorphone2, setErrorPhone2] = useState<string | null>(null)
    const [errorbank, setErrorBank] = useState<string | null>(null)
    const [errorp12, setErrorp12] = useState<string | null>(null)
    const [errorp22, setErrorp22] = useState<string | null>(null)
    const [error2, setError2] = useState<string | null>(null)
    
    const [openDialog, setOpenDialog] = useState<boolean>(false)
    const [phone, setPhone] = useState<boolean>(false)
    const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
    const [values, setValues] = React.useState({
      textmask: '----',
    });
  
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues({
        ...values,
        [event.target.name]: event.target.value,
      });
    };

    const handleCaptchaChange = (value:any) => {
        if (value) {
          setIsCaptchaVerified(true);
        }
      };

    useEffect(() => {
        const clearErrorsTimeout = setTimeout(() => {
            setErrorUser2(null);
            setErrorReal_name(null);
            setErrorPhone2(null);
            setErrorp12(null);
            setErrorp22(null);
            setError2(null);
            }, 5000);
  
            return () => clearTimeout(clearErrorsTimeout);
        }, [errorUser2, errorreal_name, errorphone2, errorp12, errorp22, error2]);
      
    const openToast = () => {
      
      const user:any = getUserFromToken();
      toast("Your account created successfully", {
        action: {
          label: "Main page",
          //@ts-ignore
          // onClick: () => push(`/profile?id=${user.id}`),
          onClick: () => {
            // Use Link to create a navigable link
            <Link href={`/${lang}/user`}>
              {dict.start}
            </Link>;
          }
        },
      })
    }
    
    const handleSubmit2 = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const regex = /^09\d{9}$/;

        const username = (document.getElementById('username2') as HTMLInputElement).value;
        const real_name = (document.getElementById('real_name') as HTMLInputElement).value;
        const phone_number= (document.getElementById('phone') as HTMLInputElement).value;
        const bank_number= (document.getElementById('bank_number') as HTMLInputElement).value;
        const password = (document.getElementById('password2') as HTMLInputElement).value;
        const password2 = (document.getElementById('password22') as HTMLInputElement).value;
        const referer = (document.getElementById('refer') as HTMLInputElement).value;
        
        if(!regex.test(phone_number)){
          setErrorPhone2(dict.signup.errors.phone_format)
          return
        }
        if(username.length < 3){
          setErrorUser2(dict.login.errors.small_username)
          return
        }
        if(!captcha){
          setError2(dict.login.errors.captcha)
          return
        }
        if (!isChecked){
          setError2(dict.signup.errors.not_checked)
          return;
        }
        if (password.length < 8) {
          setErrorp12(dict.signup.errors.password_length)
          return;
        }
        if (password != password2) {
          setErrorp22(dict.signup.errors.password_repeat)
          return;
        }

        setIsLoading2(true)
        // Prepare the data to send
        const data = {
          username: username,
          real_name:real_name,
          phone_number: phone_number,
          bank_number:bank_number,
          password: password,
          referer:referer,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const responseData = await response.json();
                setPhone(responseData.phone_number);
                setErrorUser2(null)
                setErrorReal_name(null)
                setErrorPhone2(null)
                setErrorp12(null)
                setErrorp22(null)
                setOpenDialog(true);
            } else {
                const errorData = await response.json();
                sessionStorage.removeItem('token');
                if (errorData.username) {
                  setErrorUser2(errorData.username)
                } else{
                  setErrorUser2(null)
                }
                if (errorData.phone_number) {
                  setErrorPhone2(errorData.phone_number)
                } else {
                  setErrorPhone2(null)
                }
            }
        } catch (error:any) {
          sessionStorage.removeItem('token');
          setError2(error.message)
        } finally {
          setIsLoading2(false)
        }
    };

    const handleTerms=()=>{
      setIsChecked(!isChecked)
    }

    const handlePhoneVerification = async(e: any)=>{
      e.preventDefault();
      if (!values.textmask){
        return;
      }
      const data = {
        phone_number:phone,
        code: values.textmask,
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            setUser(response);
            token = await response.json();
            sessionStorage.setItem('token', token)
            openToast();
        } else {
            const errorData = await response.json();
            sessionStorage.removeItem('token');
            if (errorData.username) {
              setErrorUser2(errorData.username)
            }
        }
      } catch (error:any) {
        sessionStorage.removeItem('token');
        setError2(error.message)
      }
    }

  return (
    <div >
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        {dict.signup.title}
      </h2>
      
      <form className="mt-8 mb-2 grid grid-cols-2" onSubmit={handleSubmit2}>
        
        <div className="col-span-2 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label htmlFor="username2">{dict.signup.username}</Label>
            <Input id="username2" placeholder="username" type="text" required/>
            {errorUser2 && <div className={`text-red-500 text-sm z-10 h-5 text-right pb-1 animate-fadeOut`}>{errorUser2}</div>}
          </LabelInputContainer>
        </div>

        <LabelInputContainer className="col-span-2 mb-4">
          <Label htmlFor="phone">{dict.signup.phone}</Label>
          <Input id="phone" type="tel" placeholder={dict.signup.phone_placeholder} required/>
          {errorphone2 && <div className={`text-red-500 text-sm z-10 h-5 text-right pb-1 animate-fadeOut`}>{errorphone2}</div>}
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="real_name">{dict.signup.real_name}</Label>
          <Input id="real_name" type="text" required/>
          {errorreal_name && <div className={`text-red-500 text-sm z-10 h-5 text-right pb-1 animate-fadeOut`}>{errorreal_name}</div>}
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="bank_number">{dict.signup.bank}</Label>
          <Input id="bank_number" type="text" required/>
          {errorbank && <div className={`text-red-500 text-sm z-10 h-5 text-right pb-1 animate-fadeOut`}>{errorbank}</div>}
        </LabelInputContainer>

        <LabelInputContainer className="col-span-2 mb-4">
          <Label htmlFor="password2">{dict.signup.password}</Label>
          <Input id="password2" placeholder="••••••••" type="password" required/>
          {errorp12 && <div className={`text-red-500 h-5 text-sm z-10 text-right pb-1 animate-fadeOut`}>{errorp12}</div>}
        </LabelInputContainer>
        
        <LabelInputContainer className="col-span-2 mb-4">
          <Label htmlFor="password22">{dict.signup.password2}</Label>
          <Input id="password22" placeholder="••••••••" type="password" />
          {errorp22 && <div className={`text-red-500 h-5 text-sm z-10 text-right pb-1 animate-fadeOut`}>{errorp22}</div>}
        </LabelInputContainer>

        <LabelInputContainer className="col-span-2 mb-8">
          <Label htmlFor="refer">{dict.signup.referer}</Label>
          <Input id="refer" placeholder={dict.signup.referer_placeholder} type="number" />
        </LabelInputContainer>

        <div className="w-full col-span-2 mb-3 flex justify-center items-center">
        <ReCAPTCHA
          sitekey={`${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} 
          onChange={handleCaptchaChange}
        />
        </div>

        <div className="col-span-2 flex items-center space-x-2 mb-3">
          <Checkbox id="terms" onCheckedChange={handleTerms}/>
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {dict.terms} 
            <Link href={`/${lang}/terms_and_conditions`}>
              {lang=="en"?<IoNavigate className="inline mx-1"/>:<PiNavigationArrowFill className="inline mx-1"/>}
            </Link>
          </label>
        </div>
        
        {error2 && <div className='text-red-500 text-sm z-10 h-5 text-right pb-1 animate-fadeOut'>{error2}</div>}
        
        <button
          className="col-span-2 bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit" disabled={isLoading2 || !isCaptchaVerified}
        >
          {isLoading2 ? `${dict.signup.loading}...` : `${dict.signup.btn}`}
          <BottomGradient />
        </button>

      </form>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className={`${openDialog?'flex flex-col':'hidden'} items-center justify-center p-3`}>
          <h1>{dict.signup.otp}</h1>
          <GetCode values={values} setValues={setValues} handleChange={handleChange} />
          <button className="border border-neutral-400 px-8 py-1 rounded hover:-translate-y-1 duration-200"
            onClick={handlePhoneVerification}>
            {dict.signup.submit_otp}
          </button>
        </DialogContent>
      </Dialog>
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
