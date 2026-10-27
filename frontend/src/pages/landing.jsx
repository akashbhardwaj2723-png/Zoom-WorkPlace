import React from 'react'
import "../App.css"
import { Link, useNavigate } from 'react-router-dom'
export default function LandingPage() {


    const router = useNavigate();

    return (
        <div className='landingPageContainer'>

            <nav>
                <div className='navHeader'>
                    <h2>My Video Call</h2>
                </div>
                <div className='navList'>
                    <p onClick={() => {
                        router("/hjfdsf")
                    }}>Join a Guest</p>
                    <p onClick={() => {
                        router("/auth")
                    }}
                    >Register</p>
                    <div role='button' className='btn'>
                        <p onClick={() => {
                            router("/auth")
                        }}
                        >Login</p>
                    </div>
                </div>
            </nav>
            <div className='landingMianContainer'>
                <div className='content'>
                    <h1> <span>Connect</span> with your loved ones</h1>
                    <p>Cover a distance My video Call</p>
                    <div role='button' className='startbtn'>
                        <Link to={"/auth"} className='home'>Get Started </Link>
                        &nbsp; &nbsp; ➜
                    </div>
                </div>
                <div className='mobileImg'>
                    <img src="/MobileImg.png" alt="" />
                </div>
            </div>

        </div>
    )
}