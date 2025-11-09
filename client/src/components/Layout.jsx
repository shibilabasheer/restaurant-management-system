import React from 'react'
import Header from './Header'
import Footer from './Footer'
import { Outlet, useLocation } from 'react-router-dom'

const Layout = () => {

    const location = useLocation();

    return (
        <>
            <div className="d-flex flex-column min-vh-100">
                <Header />
                <main className="min-vh-100 h-100 pt-1">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </>
    )
}

export default Layout
