import React from 'react'

const Popup = () => {
  return (
    <>
    <div className='min-h-100 bg-primary-white dark:bg-primary-dark p-6 flex flex-col justify-between border border-primary-dark/10 dark:border-white/10'>
        <div className="text-center mb-6">
            <h1 className='text-2xl font-bold leading-tight tracking-tight dark:text-primary-white'>
                Prompt
                <span className='text-transparent bg-clip-text bg-linear-to-r from-primary-green to-emerald-700'>
                Footprint
                </span>
            </h1>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                See the carbon cost before you send
                {/*Imma need to change ts if it only runs after the prompt is sent */}
            </p>
        </div>
        {/*

        STATS GO HERE
        
        MOST RECENT PROMPT + TOTAL OF ALL PROMPTS

        */}
        <div className="bg-white/50 dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-white/5 shadow-sm text-center flex-1 flex flex-col justify-center gap-2">
            <p className='text-sm text-primary-dark dark:text-primary-white uppercase tracking-widest font-bold'>
                Latest Prompt Impact
            </p>
            <div className="text-2xl font-black text-primary-dark dark:text-primary-white">
                0.00 <span className='text-lg text-transparent bg-clip-text bg-linear-to-r from-primary-green to-emerald-500'>gCO<sub>2</sub></span>
            </div>
            <hr className='text-primary-dark dark:text-primary-white' />
            <p className='text-sm text-primary-dark dark:text-primary-white uppercase tracking-widest font-bold'>
                Total Carbon Footprint
            </p>
            <div className="text-2xl font-black text-primary-dark dark:text-primary-white">
                0.00 <span className='text-lg text-transparent bg-clip-text bg-linear-to-r from-primary-green to-emerald-500'>gCO<sub>2</sub></span>
            </div>
        </div>

        <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-500 animate-pulse rounded-full"></div>
                <span className='text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400'>Monitoring Prompts</span>
            </div>
        </div>
    </div>
    </>
  )
}

export default Popup