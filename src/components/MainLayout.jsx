import React, { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isCompactDesktop, setIsCompactDesktop] = useState(false);
  const resizeTimeout = useRef(null);
  const layoutModeRef = useRef("");

  // Detect screen size
  const checkScreenSize = useCallback(() => {
    const width = window.innerWidth;
    const mobile = width < 1024;
    const compactDesktop = width >= 1024 && width < 1440;
    const nextMode = mobile ? "mobile" : compactDesktop ? "compact" : "wide";

    setIsMobile(mobile);
    setIsCompactDesktop(compactDesktop);

    if (layoutModeRef.current !== nextMode) {
      layoutModeRef.current = nextMode;
      setSidebarOpen(nextMode === "wide");
    }
  }, []);

  useEffect(() => {
    checkScreenSize();

    const handleResize = () => {
      clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(checkScreenSize, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkScreenSize]);

  const useOverlaySidebar = isMobile || isCompactDesktop;
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => useOverlaySidebar && setSidebarOpen(false);

  // Dynamic margin for main content
  const contentMargin = useOverlaySidebar
    ? "ml-0"
    : sidebarOpen
    ? "lg:ml-16 monitor:ml-64"
    : "lg:ml-16";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-slate-950">
      {/* Navbar */}
      <Navbar
        onMenuClick={toggleSidebar}
        isSidebarOpen={sidebarOpen}
        isMobile={isMobile}
      />

      {/* Layout Wrapper */}
      <div className="relative flex min-w-0 flex-1">
        {/* Sidebar */}
        <aside
          className={`
            fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] 
            bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 shadow-sm
            transition-all duration-300 ease-in-out
            ${useOverlaySidebar
              ? sidebarOpen
                ? "translate-x-0 w-72"
                : "-translate-x-full w-72"
              : sidebarOpen
              ? "w-16 monitor:w-64"
              : "w-16"}
          `}
        >
          <Sidebar
            isOpen={sidebarOpen}
            isMobile={isMobile}
            isOverlay={useOverlaySidebar}
            onClose={closeSidebar}
          />
        </aside>

        {/* Main Content */}
        <main
          className={`
            app-page-scroll h-screen min-w-0 flex-1 overflow-y-auto overflow-x-hidden pt-16 transition-all duration-300 ease-in-out
            ${contentMargin} w-full
          `}
        >
          <div className="w-full min-w-0 px-3 py-5 mx-auto sm:px-4 lg:px-6 max-w-screen-2xl">
            {children}
          </div>
        </main>

        {/* Mobile Overlay */}
        {useOverlaySidebar && sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            onClick={closeSidebar}
          />
        )}
      </div>
    </div>
  );
};

export default MainLayout;
