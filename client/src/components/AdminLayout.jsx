
import Header from './AdminHeader'
import Footer from './AdminFooter'
import { Outlet, useLocation } from 'react-router-dom'

const AdminLayout = () => {

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

export default AdminLayout
