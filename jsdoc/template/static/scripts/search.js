function hideSearchList()
{
    document.getElementById('search-item-ul').style.display = 'none';
}

function showSearchList()
{
    document.getElementById('search-item-ul').style.display = 'block';
}

function checkClick(e)
{
    if(e.target.id !== 'search-box-input')
    {
        setTimeout(hideSearchList, 60);
        window.removeEventListener('click', checkClick);
    }
}

function search(list, options, keys, searchKey)
{
    const defaultOptions =
    {
        shouldSort:         true,
        threshold:          0.4,
        location:           0,
        distance:           100,
        maxPatternLength:   32,
        minMatchCharLength: 1,
        keys
    };

    const op = Object.assign({}, defaultOptions, options);

    let fuse = new Fuse(list, op);
    let result = fuse.search(searchKey);
    let searchUL = document.getElementById('search-item-ul');

    searchUL.innerHTML = '';

    if(result.length === 0)
    {
        searchUL.innerHTML += '<li class="p-h-n"> No Result Found </li>';
    }
    else
    {
        result.forEach(function(item)
        {
            searchUL.innerHTML += '<li>' + item.link + '</li>';
        });
    }
}

function setupSearch(list, options)
{
    let inputBox = document.getElementById('search-box-input');
    const keys = ['title'];

    inputBox.addEventListener('keyup', function()
    {
        if(inputBox.value !== '')
        {
            showSearchList();
            search(list, options, keys, inputBox.value);
        }
        else
        {
            hideSearchList();
        }
    });

    inputBox.addEventListener('focus', function()
    {
        showSearchList();
        if(inputBox.value !== '')
        {
            search(list, options, keys, inputBox.value);
        }
        window.addEventListener('click', checkClick);
    });
}