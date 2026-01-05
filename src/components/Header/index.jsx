import Link from 'next/link'
import classes from './header.module.css'
import Navs from "./Navs"

const Header = () => {
    return (
        <>
            <header className={classes["header-container"]}>
                <div className={classes["header"]}>
                    <div className={classes["logo"]}>
                        <Link style={{color:"white"}} href="/">
                            ZeniaHub
                        </Link> 
                    </div>
                    <Navs />
                </div>
            </header>
        </>
    )
}
export default Header
