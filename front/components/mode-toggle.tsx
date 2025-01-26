"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useEffect, useState } from 'react';

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true); 
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
<>
{theme === 'dark' ? <Brightness7  sx={{m:1}}  onClick={toggleTheme} /> : <Brightness4  sx={{m:1}}  onClick={toggleTheme} />}

</>
  )
}
