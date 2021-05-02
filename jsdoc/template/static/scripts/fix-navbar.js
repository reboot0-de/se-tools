(function() {
    function setNavbarMainContentHeight() {
        let heading = document.querySelector('#navbar-heading');
        let searchBox = document.querySelector('#search-box');
        let sidebarMainContent = document.querySelector('#sidebar-main-content');

        let heightToSubtract = 20;

        if (heading) { heightToSubtract += heading.getBoundingClientRect().height; }
        if (searchBox) { heightToSubtract += searchBox.getBoundingClientRect().height; }

        sidebarMainContent.style.height = (window.innerHeight - heightToSubtract) + 'px';
    }

    setNavbarMainContentHeight();
    window.addEventListener('resize', setNavbarMainContentHeight);
})();