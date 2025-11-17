'use client';

import React from 'react';
import Image from 'next/image';

const Header = () => {
  return (
    <>
      <style>{`
        .header-container {
          min-height: clamp(106px, 26.6vh, 152px);
          padding: clamp(0.76rem, 1.52vw, 1.14rem) 1rem;
          box-shadow: 0 2px 6px rgba(168, 85, 247, 0.4);
        }
        
        .header-content {
          gap: clamp(2rem, 6vw, 5rem);
        }
        
        .header-logo {
          height: clamp(61px, 19vh, 122px);
        }
        
        .header-main-heading {
          width: clamp(46px, 9.12vw, 61px);
          height: clamp(46px, 9.12vw, 61px);
          min-width: clamp(46px, 9.12vw, 61px);
          min-height: clamp(46px, 9.12vw, 61px);
          font-size: clamp(0.95rem, 2.28vw, 1.52rem);
          background: radial-gradient(circle at top, #ee2e2e 0%, #fca63d 67%, #8b300f 100%);
        }
        
        .header-sub-heading {
          font-size: clamp(0.57rem, 1.14vw, 0.76rem);
        }
        
        @media (max-width: 768px) {
          .header-container {
            min-height: clamp(91px, 22.8vh, 137px);
            padding: clamp(0.57rem, 1.52vw, 0.95rem) 0.875rem;
          }
          
          .header-content {
            gap: clamp(1.5rem, 4vw, 3rem);
          }
          
          .header-logo {
            height: clamp(53px, 15.2vh, 99px);
          }
          
          .header-main-heading {
            width: clamp(42px, 7.6vw, 53px);
            height: clamp(42px, 7.6vw, 53px);
            min-width: clamp(42px, 7.6vw, 53px);
            min-height: clamp(42px, 7.6vw, 53px);
            font-size: clamp(0.86rem, 1.9vw, 1.14rem);
          }
          
          .header-heading-div {
            gap: 0.285rem;
          }
          
          .header-sub-heading {
            font-size: clamp(0.53rem, 0.95vw, 0.68rem);
          }
        }
        
        @media (max-width: 480px) {
          .header-container {
            min-height: clamp(76px, 19vh, 106px);
            padding: clamp(0.38rem, 1.14vw, 0.67rem) 0.75rem;
          }
          
          .header-content {
            flex-direction: column;
            gap: clamp(0.75rem, 2vw, 1rem);
          }
          
          .header-logo {
            height: clamp(46px, 11.4vh, 68px);
          }
          
          .header-heading-div {
            gap: 0.19rem;
          }
          
          .header-main-heading {
            width: clamp(34px, 6.08vw, 42px);
            height: clamp(34px, 6.08vw, 42px);
            min-width: clamp(34px, 6.08vw, 42px);
            min-height: clamp(34px, 6.08vw, 42px);
            font-size: clamp(0.67rem, 1.52vw, 0.86rem);
          }
          
          .header-sub-heading {
            font-size: clamp(0.49rem, 0.76vw, 0.61rem);
          }
        }
        
        @media (max-width: 320px) {
          .header-container {
            min-height: clamp(61px, 15.2vh, 84px);
            padding: clamp(0.29rem, 0.76vw, 0.48rem) 0.5rem;
          }
          
          .header-content {
            gap: clamp(0.5rem, 1.5vw, 0.75rem);
          }
          
          .header-logo {
            height: clamp(38px, 9.12vh, 53px);
          }
          
          .header-main-heading {
            width: clamp(30px, 5.32vw, 38px);
            height: clamp(30px, 5.32vw, 38px);
            min-width: clamp(30px, 5.32vw, 38px);
            min-height: clamp(30px, 5.32vw, 38px);
            font-size: clamp(0.57rem, 1.33vw, 0.76rem);
          }
          
          .header-heading-div {
            gap: 0.19rem;
          }
          
          .header-sub-heading {
            font-size: clamp(0.46rem, 0.68vw, 0.53rem);
          }
        }
        /* Force header to always be dark mode - override any light mode styles */
        .header-container {
          background-color: #000 !important;
        }
        
        .header-main-heading {
          color: #fff !important;
          background: radial-gradient(circle at top, #ee2e2e 0%, #fca63d 67%, #8b300f 100%) !important;
        }
        
        .header-sub-heading {
          color: rgb(227, 223, 223) !important;
        }
        
        /* Ensure header text colors are not affected by light mode */
        .light .header-container,
        .light .header-container .header-main-heading,
        .light .header-container .header-sub-heading {
          background-color: #000 !important;
          color: #fff !important;
        }
        
        .light .header-container .header-sub-heading {
          color: rgb(227, 223, 223) !important;
        }
        
        .light .header-container .header-main-heading span {
          color: rgb(164, 222, 78) !important;
        }
      `}</style>
      <header
        className="bg-black w-full flex items-center justify-center rounded-b-[10px] overflow-hidden header-container"
        style={{ backgroundColor: '#000' }}
      >
        <div className="flex justify-center items-center w-full max-w-[1200px] flex-wrap header-content">
          <div className="flex-none flex items-center justify-center relative header-logo">
            <Image
              src="/pic.jpg"
              alt="Logo"
              width={122}
              height={122}
              className="w-auto h-auto object-contain block"
              priority
            />
          </div>
          <div
            className="flex flex-col items-center justify-center text-center header-heading-div"
            style={{ gap: '0.38rem' }}
          >
            <div
              className="rounded-full flex justify-center items-center text-white font-bold whitespace-nowrap p-0 text-center leading-none header-main-heading"
              style={{ color: '#fff' }}
            >
              codestorywith
              <span
                className="text-[rgb(164,222,78)]"
                style={{ color: 'rgb(164,222,78)' }}
              >
                MIK
              </span>
            </div>
            <p
              className="text-[rgb(227,223,223)] italic m-0 p-0 leading-tight header-sub-heading"
              style={{ color: 'rgb(227,223,223)' }}
            >
              &apos;Aao, story se code likhe&apos;
            </p>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
