// ==UserScript==
// @name         Deezer Sidebar Artists
// @namespace    https://github.com/tnodet/deezer-sidebar-shortcuts
// @version      0.2
// @date         2018-11-06
// @description  Add a shortcut for the 'Artists' page to Deezer's sidebar
// @author       Tanguy Nodet
// @include      https://www.deezer.com/*
// @require      https://raw.githubusercontent.com/uzairfarooq/arrive/master/minified/arrive.min.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

'use strict';

/* We need to watch for a change in the URL in order to toggle the 'Artists' nav-link as active or not
    https://stackoverflow.com/questions/6390341/how-to-detect-url-change-in-javascript
    https://stackoverflow.com/questions/38667729/is-there-an-event-that-fires-when-url-changes
    https://stackoverflow.com/questions/10419898/is-there-a-callback-for-history-pushstate/10419974#10419974
   Possibilities:
    - popstate: only works with browser controls (backwards/forwards buttons)
        -> monkey-patch the history.pushState function
    - polling: check every X ms for a change to window.location.href -> bad for performances
*/

//window.addEventListener('popstate', function(e){console.log('url changed')}); // only works for browser controls (e.g. back button)

/* Monkey-patching of the history.pushState function */
var pushState = history.pushState;
history.pushState = function () {
    pushState.apply(history, arguments);
    urlChanged(arguments);  // our own event-handling function
};


var sidebarNavList; // global variable to keep track of the sidebar-nav-list

// watch for creation of a 'ul' tag in the document
document.arrive("ul", navListArrived);


/* Callback function for 'ul' arrive.js watcher */
function navListArrived() {
    // Test if the sidebar-nav-list has been created
    if (this.classList.contains("sidebar-nav-list")) {
        document.unbindArrive(navListArrived); // unbind the arrive.js watcher
        console.log("[DeezerSidebarArtists] nav-list arrived!");
        console.log(this);
        sidebarNavList = this;
        sidebarAddArtists(this);    // call the function to add "Artists" to the sidebar-nav-list
    }
}

/* Function called at each call of history.pushState (i.e. URL change) */
function urlChanged(){
    var pathArray = getPathArray();
    console.log("[DeezerSidebarArtists] URL changed! New URL is: %s", pathArray.join('/'));
    if(hasNavItemArtist(sidebarNavList)) {
        handleArtistNavItemState(pathArray, getNavItemArtist(sidebarNavList), getUserId(sidebarNavList));
    }
}


function sidebarAddArtists(sidebarNavList) {

    pathArray = getPathArray();

    var lang = pathArray[1]; // get current locale
    var userId = getUserId(sidebarNavList);
    //console.log("[DeezerSidebarArtists] We are at %s%s - lang is %s", hostname, pathname, lang);*/

    var hasArtistLink = hasNavItemArtist(sidebarNavList);
    var navItemArtist = getNavItemArtist(sidebarNavList);
    var navItemAlbum = getNavItemAlbum(sidebarNavList);


    var linkPathArray;
    
    /* If the "Artists" nav-item doesn't exist, create it and add it to the nav-list*/
    if (!hasArtistLink) {

        var navItemClone = navItemAlbum.cloneNode(true);   // make a clone of the "Albums" nav-item of the nav-list
        var link = navItemClone.getElementsByTagName("a")[0];   // get the link (<a> tag), which is the only list item's node

        /* Change the link */
        linkPathArray = link.getAttribute("href").split('/');
        linkPathArray[linkPathArray.length - 1] = "artists";
        link.setAttribute("href",linkPathArray.join('/'));

        /* Change the icon */
        var svg = link.getElementsByTagName("svg")[0];
        svg.className = ["svg-icon", "svg-icon-artist"];    // set the class name to artist
        svg.getElementsByTagName("g")[0].getElementsByTagName("path")[0].setAttribute("d","M 0.95566999,11.759512 C 0.78577,11.589622 0.7155,11.359242 0.7155,10.972112 c 0,-0.9781196 0.22858999,-1.5863692 0.82707,-2.2007292 1.00032,-1.02687 2.31151,-1.45494 4.45658,-1.45494 2.14681,0 3.44538,0.41671 4.42147,1.41882 0.645991,0.66321 0.862181,1.22009 0.862181,2.2208192 0,1.09183 0.245419,1.0436 -5.310371,1.0436 -4.61649,0 -4.78465,-0.008 -5.01676001,-0.24017 z M 5.05373,6.5361828 c -1.17079,-0.36517 -1.69804,-1.38528 -1.69377,-3.27704 0.003,-1.38075 0.1926,-1.90377 0.93076,-2.56929005 1.0202,-0.9198 2.39666,-0.9198 3.41686,0 0.72557,0.65416005 0.92762,1.19513005 0.93076,2.49196005 0.003,1.33699 -0.23487,2.19684 -0.77343,2.79296 -0.6237,0.69036 -1.70523,0.90635 -2.81118,0.56141 z");  // set the SVG icon

        /* Change the label */
        var label = link.getElementsByClassName("sidebar-nav-label")[0];
        label.innerText = "Artists";

        /* Add the clone to the nav-list, after the "Albums" nav-item */
        navItemArtist = sidebarNavList.insertBefore(navItemClone, navItemAlbum.nextSibling)

        console.log("[DeezerSidebarArtists] 'Artists' nav-item added!")

    }
    handleArtistNavItemState(pathArray, navItemArtist, userId);

}


function getPathArray() {
    return window.location.pathname.split('/');
}


function getSidebarNavList() {
    var sidebar = document.getElementById("page_sidebar").getElementsbyClassName("sidebar-nav-list")[0];
    //console.log("[DeezerSidebarArtists] There are %i elements in the nav-list: %s", sidebarNavList.childElementCount, sidebarNavList);
}

function getUserId(sidebarNavList) {
    return sidebarNavList.childNodes[3].getElementsByTagName("a")[0].getAttribute("href").split('/')[3]; // get user id (from 'My Music' link)
}

function hasNavItemArtist(sidebarNavList) {
     /* Check if the "Artists" nav-item exists */
    var navItemArtist = getNavItemArtist(sidebarNavList);
    return (navItemArtist === undefined ? false : true);
}

function getNavItemArtist(sidebarNavList) {
    /* Return the "Artists" nav-item (if existing) */
    return getNavItem(sidebarNavList, "artists");
}

function getNavItemAlbum(sidebarNavList) {
    /* Return the "Albums" nav-item (if existing) */
    return getNavItem(sidebarNavList, "albums");
}

function getNavItem(sidebarNavList, urlSuffix) {
    var navItem;
    /* Return the corresponding nav-item (if existing) */
    for (var i = sidebarNavList.childNodes.length - 1; i >= 0; i--) {
        linkPathArray = sidebarNavList.childNodes[i].getElementsByTagName("a")[0].getAttribute("href").split('/');
        if (linkPathArray[linkPathArray.length - 1] === urlSuffix) {
            navItem = sidebarNavList.childNodes[i];
            break;  // end the for-loop
        }
    }
    return navItem;
}


function handleArtistNavItemState(pathArray, navItemArtist, userId) {
    /* Set the "Artists" nav-item as active or inactive */
    handleNavItemState(pathArray, navItemArtist, "artists", userId);
}

function handleNavItemState(pathArray, navItem, urlSuffix, userId) {
    var res;
    /* Set a nav-item as active or inactive, depending on the current url */
    //console.log("[DeezerSidebarArtists] url suffix = %s ; user id = %s", urlSuffix, userId);
    if(pathArray[pathArray.length - 1] === urlSuffix && pathArray[pathArray.length - 2] == userId) {
        // the URL is [...]/user-id/<urlSuffix>, set the corresponding nav-link as active
        res = toggleNavItemActive(navItem, true); // force-add 'is-active' class
    } else {
        res = toggleNavItemActive(navItem, false); // force-remove 'is-active' class
    }
    var state;
    (res ? state = "active" : state = "inactive");
    console.log("[DeezerSidebarArtists] '%s' nav-item set as %s", navItem.firstChild.childNodes[1].innerText, state);
}

/**
 * Toggles the 'is-active' class of the nav-link of a nav-item inside the nav-list.
 *
 * @param {Element} navItem - the nav-item list element which activeness should be toggled
 * @param {Boolean} [force] - if unset, the 'activeness' is toggled; if set to true, the 'is-active' class is added; if set to false, the 'is-active' class is removed
 * @ return true if 'is-active' was added, false if it was removed
 */
function toggleNavItemActive(navItem, force) {
    var navLink = navItem.getElementsByTagName("a")[0];
    if (force === undefined) {
        return navLink.classList.toggle("is-active");
    } else {
        return navLink.classList.toggle("is-active", force);
    }
}