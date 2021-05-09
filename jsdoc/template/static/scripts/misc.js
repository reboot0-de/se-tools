function copy(value)
{
    const el = document.createElement('textarea');
    el.value = value.replace(/JAVASCRIPT\nCopied!$/, '');

    document.body.appendChild(el);

    el.select();
    document.execCommand('copy');

    document.body.removeChild(el);
}

function showTooltip(id)
{
    let tooltip = document.getElementById(id);
    tooltip.classList.add('show-tooltip');

    setTimeout(function() { tooltip.classList.remove('show-tooltip'); }, 3000);
}

function copyFunction(id)
{
    let code = document.getElementById(id);

    let element = code.querySelector('.linenums');
    if (!element) { element = code.querySelector('code'); }

    copy(element.innerText);

    showTooltip('tooltip-' + id);
}

function toggleAccordion(element, isImmediate)
{
    let currentNode = element;
    let isCollapsed = currentNode.classList.contains('collapsed');
    let currentNodeUL = currentNode.querySelector('.accordion-content');

    if(isCollapsed)
    {
        if(isImmediate)
        {
            currentNode.classList.remove('collapsed');
            currentNodeUL.style.height = 'auto';
            return;
        }

        let scrollHeight = currentNodeUL.scrollHeight;

        currentNodeUL.style.height = scrollHeight + 'px';
        currentNode.classList.remove('collapsed');

        setTimeout(function()
        {
            if(!currentNode.classList.contains('collapsed')) { currentNodeUL.style.height = 'auto'; }
        }, 500);
    }
    else
    {
        currentNodeUL.style.height = '0px';
        currentNode.classList.add('collapsed');
    }
}

function toggleNavbar(element, navbar)
{
    let isExpanded = element.classList.contains('expanded');

    if(isExpanded)
    {
        element.classList.remove('expanded');
        navbar.classList.remove('expanded');
    }
    else
    {
        element.classList.add('expanded');
        navbar.classList.add('expanded');
    }
}

(function()
{
    let allPre = document.getElementsByTagName('pre');
    let i, classList;

    for (i = 0; i < allPre.length; i++)
    {
        classList = allPre[i].classList;
        let id = 'pre-id-' + i;

        let tooltip = '<div class="tooltip" id="tooltip-' + id + '">Copied!</div>';

        let copyToClipboard = '<div class="code-copy-icon-container" onclick="copyFunction(\'' + id + '\')"><div><svg class="sm-icon"><use xlink:href="#copy-icon"></use></svg>' + tooltip + '<div></div>';

        let langName = classList[classList.length - 1].split('-')[1];

        if (langName === undefined) { langName = 'JavaScript'; }

        let langNameDiv = '<div class="code-lang-name-container"><div class="code-lang-name">' + langName.toLocaleUpperCase() + '</div></div>';

        allPre[i].innerHTML += '<div class="pre-top-bar-container">' + langNameDiv + copyToClipboard + '</div>';
        allPre[i].setAttribute('id', id);
    }

    let allAccordion = document.querySelectorAll('.accordion-heading');

    allAccordion.forEach(function(item)
    {
        item.addEventListener('click', function() { toggleAccordion(item.parentNode); } );
    });

    let navbarHam = document.querySelector('#navbar-ham');
    let navbar = document.querySelector('#navbar');

    if(navbarHam && navbar)
    {
        navbarHam.addEventListener('click', function() { toggleNavbar(navbarHam, navbar); });
    }
})();