import React from 'react'
import Head from 'next/head';

export default function Meta() {
    return (
        <Head>
           /* Primary Meta Tags */
            <title>HKU.way2way</title>
            <meta charSet="utf-8" />
            <meta name="title" content="HKU.way2way" />
            <meta name="description"
                content="Group8 Jobs's Personal Portfolio Website. Made with Ubuntu 20.4 (Linux) theme by Next.js and Tailwind CSS." />
            <meta name="author" content="Group8 Jobs" />
            <meta name="keywords"
                content="group8 jobs, group8jobs's portfolio, group8jobs linux, ubuntu portfolio, group8 jobs protfolio,group8 jobs computer, group8 jobs, group8 ubuntu, group8 jobs ubuntu portfolio" />
            <meta name="robots" content="index, follow" />
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="language" content="English" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content="#E95420" />

            /* Search Engine */
            <meta name="image" content="images/logos/HK_pink.png" /> 
            {/* fevicon.png */}
            /* Schema.org for Google */
            <meta itemProp="name" content="group8 project - Faculty of Engineering" />
            <meta itemProp="description"
                content="nothing." />
            <meta itemProp="image" content="images/logos/HK_pink.png" />
            {/* fevicon.png */}
            /* Twitter */
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content="group8 jobs Portfolio - Computer Engineering Student" />
            <meta name="twitter:description"
                content="group8 jobs's (group8jobs) Personal Portfolio Website. Made with Ubuntu 20.4 (Linux) theme by Next.js and Tailwind CSS." />
            <meta name="twitter:site" content="group8jobs" />
            <meta name="twitter:creator" content="group8jobs" />
            <meta name="twitter:image:src" content="images/logos/HK_pink.png" />
            {/* logo_1024.png */}
            /* Open Graph general (Facebook, Pinterest & Google+) */
            <meta name="og:title" content="group8 jobs Portfolio - Computer Engineering Student" />
            <meta name="og:description"
                content="group8 jobs's (group8jobs) Personal Portfolio Website. Made with Ubuntu 20.4 (Linux) theme by Next.js and Tailwind CSS." />
            <meta name="og:image" content="images/logos/HK_pink.png" />
            {/* logo_1200.png */}
            <meta name="og:url" content="http://group8jobs.github.io/" />
            <meta name="og:site_name" content="group8 jobs Personal Portfolio" />
            <meta name="og:locale" content="en_IN" />
            <meta name="og:type" content="website" />

            <link rel="icon" href="images/logos/HK_pink.png" />
            {/* fevicon.svg */}
            <link rel="apple-touch-icon" href="images/logos/HK_pink.png" />
            {/* logo.png */}
            <link rel="preload" href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap" as="style" />
            <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap" rel="stylesheet"></link>
        </Head>
    )
}
