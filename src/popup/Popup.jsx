import React, { useEffect, useState } from 'react'
import { SITE_CONFIG } from '../utils/config';

const Popup = () => {

    const [totalEmissions, setTotalEmissions] = useState(0);
    const [latestEmissions, setLatestEmissions] = useState(0);
    const [inputEmissions, setInputEmissions] = useState(0);
    const [outputEmissions, setOutputEmissions] = useState(0);

    const [isSupportedSite, setIsSupportedSite] = useState(false);

    useEffect(() => {

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].url) {
                try {
                    const url = new URL(tabs[0].url);
                    let hostname = url.hostname;
                    if (hostname.startsWith('www.')) hostname = hostname.replace('www.', '');

                    if (SITE_CONFIG[hostname]) {
                        setIsSupportedSite(true);
                    }

                } catch (error) {
                    console.error("PromptFootprint: Error parsing URL: ", error);
                }
            }
        });
        //get stuff from chrome storage
        chrome.storage.local.get(['totalEmissions', 'latestEmissions', 'latestInputEmissions', 'latestOutputEmissions'], (results) => {
            if (results.totalEmissions) setTotalEmissions(results.totalEmissions);
            if (results.latestEmissions) setLatestEmissions(results.latestEmissions);
            if (results.latestInputEmissions) setInputEmissions(results.latestInputEmissions);
            if (results.latestOutputEmissions) setOutputEmissions(results.latestOutputEmissions);
        });

        //update ui when stuff actually happens
        const storageListener = (changes, namespace) => {
            if (namespace === 'local') {
                if (changes.totalEmissions) setTotalEmissions(changes.totalEmissions.newValue);
                if (changes.latestEmissions) setLatestEmissions(changes.latestEmissions.newValue);
                if (changes.latestInputEmissions) setInputEmissions(changes.latestInputEmissions.newValue);
                if (changes.latestOutputEmissions) setOutputEmissions(changes.latestOutputEmissions.newValue);
            }
        };
        chrome.storage.onChanged.addListener(storageListener);

        return () => chrome.storage.onChanged.removeListener(storageListener);
    }, []);

  return (
    <>
    <div className='min-h-100 bg-primary-white dark:bg-primary-dark p-6 flex flex-col justify-between border border-primary-dark/10 dark:border-white/10'>
        <div className="text-center mb-6">
            <a href="https://promptfootprint.vercel.app/" target='_blank' rel='noreferrer'>
            <h1 className='text-2xl font-bold leading-tight tracking-tight dark:text-primary-white'>
                Prompt
                <span className='text-transparent bg-clip-text bg-linear-to-r from-primary-green to-emerald-700'>
                Footprint
                </span>
            </h1>
            </a>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                See the carbon cost before you send
                {/*Imma need to change ts if it only runs after the prompt is sent */}
            </p>
        </div>

    <div className="bg-white/50 dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-white/5 shadow-sm text-center flex-1 flex flex-col justify-center gap-3">
            
        <div className="flex justify-center w-full">
            <div className="relative inline-flex items-center gap-1.5 group cursor-help">
                <p className='text-sm text-primary-dark dark:text-primary-white uppercase tracking-widest font-bold'>
                    Latest Prompt Impact
                </p>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400 group-hover:text-primary-green transition-colors shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>

                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 pointer-events-none w-48 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl border border-gray-700 z-50">
                    <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Input (Prompt):</span>
                        <span className="font-bold">{inputEmissions > 0 ? inputEmissions.toFixed(4) : "0.00"}g</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Output (Response):</span>
                        <span className="font-bold">{outputEmissions > 0 ? outputEmissions.toFixed(4) : "0.00"}g</span>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                </div>
                </div>
            </div>

            <div className="text-2xl font-black text-primary-dark dark:text-primary-white -mt-1">
                { latestEmissions > 0 ? latestEmissions.toFixed(4) : "0.00" } <span className='text-lg text-transparent bg-clip-text bg-linear-to-r from-primary-green to-emerald-500'>gCO<sub className='text-primary-green'>2</sub></span>
            </div>

            <hr className='text-primary-dark dark:text-primary-white my-1 opacity-20' />
            
            <p className='text-sm text-primary-dark dark:text-primary-white uppercase tracking-widest font-bold'>
                Total Carbon Footprint
            </p>
            <div className="text-2xl font-black text-primary-dark dark:text-primary-white">
                { totalEmissions > 0 ? totalEmissions.toFixed(4) : "0.00" } <span className='text-lg text-transparent bg-clip-text bg-linear-to-r from-primary-green to-emerald-500'>gCO<sub className='text-primary-green'>2</sub></span>
            </div>
        </div>
        <div className="mt-6 text-center">
            {isSupportedSite ? (
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-500 animate-pulse rounded-full"></div>
                <span className='text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400'>Monitoring Prompts</span>
            </div>
            ) : (
                <div className="inline-flex items-center gap-2 bg-gray-500/10 px-3 py-1.5 rounded-full border border-gray-500/20">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400'>Engine Asleep</span>
                </div>
            )}
        </div>
    </div>
    </>
  )
}

export default Popup