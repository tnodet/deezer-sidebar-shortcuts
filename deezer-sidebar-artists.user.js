// ==UserScript==
// @name         Deezer Sidebar Artists
// @namespace    https://github.com/tnodet/deezer-sidebar-shortcuts
// @version      0.1
// @date         2018-10-30
// @description  Add a shortcut for the 'Artists' page to Deezer's sidebar
// @author       Tanguy Nodet
// @include      https://www.deezer.com/*
// @require      https://raw.githubusercontent.com/uzairfarooq/arrive/master/minified/arrive.min.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

'use strict';

// watch for creation of a 'ul' tag in the document
document.arrive("ul", navListArriveListenner);

/* Callback function for 'ul' arrive.js watcher */
function navListArriveListenner() {
    // Test if the sidebar-nav-list has been created
    if (this.classList.contains("sidebar-nav-list")) {
        document.unbindArrive(navListArriveListenner); // unbind the arrive.js watcher
        console.log("[DeezerSidebarArtists] nav-list arrived!");
        console.log(this);
        sidebarAddArtists(this);    // call the function to add "Artists" to the sidebar-nav-list
    }
}


function sidebarAddArtists(sidebarNavList) {

    /*var hostname = window.location.hostname;
    var pathname = window.location.pathname;
    var pathArray = pathname.split('/');
    var lang = pathArray[1];
    //console.log("[DeezerSidebarArtists] We are at %s%s - lang is %s", hostname, pathname, lang);*/

    //var sidebar = document.getElementById("page_sidebar");
    //var sidebarNavList = sidebar.getElementsbyClassName("sidebar-nav-list")[0];
    //console.log("[DeezerSidebarArtists] There are %i elements in the nav-list: %s", sidebarNavList.childElementCount, sidebarNavList);

    var hasArtistLink = false;
    var navItemArtist;
    var navItemAlbum;

    var linkPathArray;

    /* Check if the "Artists" nav-item exists, get the "Artists" (if existing) and "Albums" nav-item */
    for (var i = sidebarNavList.childNodes.length - 1; i >= 0; i--) {
        //console.log(sidebarNavList.childNodes[i].getElementsByTagName("a")[0].getAttribute("href"));
        linkPathArray = sidebarNavList.childNodes[i].getElementsByTagName("a")[0].getAttribute("href").split('/');
        //console.log(linkPathArray);
        if (linkPathArray[linkPathArray.length - 1] === "artists") {
            hasArtistLink = true;
            navItemArtist = sidebarNavList.childNodes[i];
        } else if (linkPathArray[linkPathArray.length - 1] === "albums") {
            navItemAlbum = sidebarNavList.childNodes[i];
        }
    }

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

    }

    /* Set the "Artists" nav-item as active or inactive */
    //TODO

}