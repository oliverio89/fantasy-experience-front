import { FunctionComponent, memo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../i18n";
import NotificationCenter from "./NotificationCenter";

export type FrameComponent1Type = {
  className?: string;
};

const DiceMark = () => (
  <svg
    aria-hidden="true"
    className="h-10 w-10"
    viewBox="0 0 48 48"
    fill="none"
  >
    <path
      d="M24 3.75 41.5 14v20L24 44.25 6.5 34V14L24 3.75Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="m6.5 14 17.5 9.7L41.5 14M24 23.7v20.55M24 3.75v19.9M15.4 9l8.6 14.7L32.6 9"
      stroke="currentColor"
      strokeWidth="1.2"
      opacity=".72"
    />
    <path d="M24 17.2 27 22h-6l3-4.8Z" fill="currentColor" />
  </svg>
);

const Navbar: FunctionComponent<FrameComponent1Type> = memo(
  ({ className = "" }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, userRole } = useAuth();
    const { t } = useTranslation();

    const goTo = (path: string) => {
      navigate(path);
      setMenuOpen(false);
    };

    const navItems = [
      { path: "/", label: t.navbar.home, aria: t.navbar.ariaHome },
      {
        path: "/ourmasters",
        label: t.navbar.masters,
        aria: t.navbar.ariaMasters,
      },
      { path: "/nextgames", label: t.navbar.games, aria: t.navbar.ariaGames },
      { path: "/contacto", label: t.navbar.contact, aria: t.navbar.ariaContact },
    ];

    const isActive = (path: string) =>
      path === "/"
        ? location.pathname === path
        : location.pathname.startsWith(path);

    const accountPath = user ? "/user" : "/login";

    return (
      <header
        className={`sticky top-0 z-[99] border-b border-[#d8a651]/25 bg-[#100c09]/95 text-[#f2e6cf] shadow-[0_10px_35px_rgba(0,0,0,0.28)] backdrop-blur-xl ${className}`}
      >
        <div className="mx-auto flex h-[82px] w-full max-w-[1240px] items-center justify-between gap-8 px-8 mq750:h-[72px] mq750:px-4">
          <button
            type="button"
            onClick={() => goTo("/")}
            className="group flex shrink-0 items-center gap-3 bg-transparent p-0 text-left text-[#d9a84f]"
            aria-label={t.navbar.ariaHome}
          >
            <span className="transition-transform duration-300 group-hover:rotate-6">
              <DiceMark />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-milonga text-[19px] tracking-[-0.02em] text-[#f2e6cf]">
                Fantasy
              </span>
              <span className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.27em] text-[#d9a84f]">
                Experience
              </span>
            </span>
          </button>

          <nav
            aria-label={t.navbar.ariaNav}
            className="flex items-center gap-1 rounded-full border border-[#e2bd72]/15 bg-black/20 p-1.5 mq1050:hidden"
          >
            {navItems.map((item) => (
              <button
                key={item.path}
                type="button"
                aria-label={item.aria}
                aria-current={isActive(item.path) ? "page" : undefined}
                onClick={() => goTo(item.path)}
                className={`min-h-[40px] rounded-full bg-transparent px-5 text-[15px] font-bold transition-colors ${
                  isActive(item.path)
                    ? "bg-[#d9a84f]/12 text-[#e7bd69]"
                    : "text-[#f2e6cf]/72 hover:text-[#f2e6cf]"
                }`}
              >
                {item.label}
              </button>
            ))}
            {user && (userRole === "master" || userRole === "admin") && (
              <button
                type="button"
                aria-label={t.navbar.ariaCreateGame}
                aria-current={isActive("/crearpartida") ? "page" : undefined}
                onClick={() => goTo("/crearpartida")}
                className="min-h-[40px] rounded-full bg-transparent px-5 text-[15px] font-bold text-[#d9a84f] hover:bg-[#d9a84f]/10"
              >
                {t.navbar.createGame}
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3 mq1050:hidden">
            <NotificationCenter />
            <button
              type="button"
              onClick={() => goTo(accountPath)}
              aria-label={user ? t.navbar.ariaMyAccount : t.navbar.ariaLogin}
              className="fe-button-secondary gap-2 bg-transparent px-5 text-sm"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <circle cx="12" cy="8" r="3.2" />
                <path d="M5.5 20c.6-4 2.8-6 6.5-6s5.9 2 6.5 6" />
              </svg>
              {user ? t.navbar.myAccount : t.navbar.login}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? t.navbar.ariaCloseMenu : t.navbar.ariaOpenMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="hidden h-12 w-12 items-center justify-center rounded-full border border-[#e6c78b]/35 bg-transparent text-[#e7c57f] mq1050:inline-flex"
          >
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              {menuOpen ? (
                <path d="m6 6 12 12M18 6 6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 top-[72px] z-40 bg-black/70 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
              aria-label={t.navbar.ariaCloseMenu}
            />
            <div
              id="mobile-menu"
              className="fixed inset-x-3 top-[84px] z-50 rounded-2xl border border-[#d8a651]/30 bg-[#17100b] p-4 shadow-2xl"
            >
              <nav aria-label={t.navbar.ariaMobileNav} className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    aria-label={item.aria}
                    aria-current={isActive(item.path) ? "page" : undefined}
                    onClick={() => goTo(item.path)}
                    className={`rounded-xl bg-transparent px-4 py-3 text-left text-lg font-bold ${
                      isActive(item.path)
                        ? "bg-[#d9a84f]/12 text-[#e7bd69]"
                        : "text-[#f2e6cf]/78"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                {user && (userRole === "master" || userRole === "admin") && (
                  <button
                    type="button"
                    onClick={() => goTo("/crearpartida")}
                    className="rounded-xl bg-transparent px-4 py-3 text-left text-lg font-bold text-[#d9a84f]"
                  >
                    {t.navbar.createGame}
                  </button>
                )}
                <div className="fe-divider my-2" />
                <div className="flex items-center justify-between gap-3">
                  <NotificationCenter />
                  <button
                    type="button"
                    onClick={() => goTo(accountPath)}
                    className="fe-button flex-1"
                  >
                    {user ? t.navbar.myAccount : t.navbar.login}
                  </button>
                </div>
              </nav>
            </div>
          </>
        )}
      </header>
    );
  },
);

Navbar.displayName = "Navbar";

export default Navbar;
