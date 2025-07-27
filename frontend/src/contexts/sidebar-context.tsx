'use client';

import { Dispatch, SetStateAction, createContext } from 'react';

export const SidebarContext = createContext<Dispatch<SetStateAction<boolean>>>((_b) => { });
