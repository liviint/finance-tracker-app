"use client"
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import classes from "./footer.module.css"

const Footer = () => {
  const pathName = usePathname()
    if(
      pathName.startsWith("/journal") ||
      pathName.startsWith("/habits") 
    ) return null
    return (
        <footer className={classes["footer"]}>
          <div className={classes["footer-content"]}>
            <div className="py-2">
              <Link href="/about" >About us</Link>
            </div>
            {/* <div className={classes["social-links"]}>
              <a href="https://web.facebook.com/profile.php?id=61578131458649" target="_blank">
                <img src="https://img.icons8.com/?size=100&id=118468&format=png&color=ffffff" alt="Facebook" />
                
              </a>
              <a href="https://x.com/liviintHomes" target="_blank">
                <img src="https://img.icons8.com/?size=100&id=6Fsj3rv2DCmG&format=png&color=ffffff" alt="Twitter" />
              </a>
              <a href="https://www.instagram.com/liviinthomes/" target="_blank">
                <img src="https://img.icons8.com/?size=100&id=32292&format=png&color=ffffff" alt="Instagram" />
              </a>
              <a href="https://www.tiktok.com/@liviint.homes" target="_blank">
                <img src="https://img.icons8.com/?size=100&id=84521&format=png&color=ffffff" alt="TikTok" />
              </a>
              <a href="https://www.linkedin.com/company/liviinthomes/" target="_blank">
                <img src="https://img.icons8.com/?size=100&id=447&format=png&color=ffffff" alt="TikTok" />
              </a>
            </div> */}
            <p>© 2025 ZeniaHub. All rights reserved.</p>
          </div>
        </footer>
    )
}

export default Footer
